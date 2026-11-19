# Access LXC: a second way in

The admin UIs (Proxmox, Komodo) are reached from outside through Pangolin like everything else. With a single newt on
the Docker VM, that path depended on the one guest it is most often needed to repair: when the Docker VM hangs or
restarts, the tunnel goes with it.

LXC `access` runs a second newt as its own Pangolin site and carries a fallback resource for the Proxmox UI, with
Pangolin's SSO always on. Two independent ways in, so either can fail:

| Resource | Pangolin site | Survives |
|---|---|---|
| Proxmox UI, Komodo (main) | newt on the Docker VM | a broken `access` LXC |
| Proxmox UI (fallback) | newt in LXC `access` | a broken or restarting Docker VM |

Komodo has no fallback resource: with the Docker VM down, its VM is reachable through the Proxmox console.

## Design

- **Small and separate.** Unprivileged Debian LXC, 1 core, 512 MB RAM, 4 GB disk, starts with the host.
- **No dependencies on the rest of the platform.** No Docker, not deployed by Komodo, no secrets from OpenBao: it must
  work when exactly those are broken. newt is a plain binary (checksum-verified) with a systemd unit.
- **Egress allowlist** ([nftables.conf](nftables.conf)). Nothing may connect in. Out: DNS on the router, the Proxmox
  UI, the Komodo UI and the public internet (the Pangolin VPS, Debian updates). Every other LAN address is dropped, so
  a compromised newt cannot reach the Docker VM, OpenBao or anything else on the network.
- **Sandboxed service** ([newt.service](newt.service)). Own user, no capabilities, read-only system, and it only
  starts while the firewall is active (`Requires=nftables.service`).
- **Credentials** in a root-only env file; newt's own copy sits in a `0700` state directory.
- **Updates.** Debian through `unattended-upgrades`; newt by hand, because Renovate does not see a binary in an LXC.

## Setup

[create-access-lxc.sh](create-access-lxc.sh) runs on the Proxmox host. It refuses to touch an ID or address that is
already in use, creates the LXC from the official Debian template and runs [setup-inside.sh](setup-inside.sh), which
installs newt, the firewall and automatic updates and then checks reachability: the admin UIs and the VPS must answer,
the Docker VM and the router UI must not. newt starts once its credentials are in place:

    read -rp 'Newt ID: ' ID; read -rsp 'Newt secret: ' S; echo
    printf 'PANGOLIN_ENDPOINT=https://pangolin.example.com\nNEWT_ID=%s\nNEWT_SECRET=%s\n' "$ID" "$S" \
      | pct exec 104 -- sh -c 'umask 077; cat > /etc/newt/newt.env'; unset ID S
    pct exec 104 -- systemctl restart newt

No SSH and no root password in the LXC: `pct enter 104` from the host.

## Lessons from building it

- **Pick the architecture explicitly.** `pveam available` lists templates for amd64 and arm64; "the newest Debian 13
  template" sorted to the arm64 one, which an x86 host cannot start.
- **`systemctl enable --now` does not reload a running service.** The template already ran `nftables` with Debian's
  accept-all default, so the new rules only applied after a restart. The script's own reachability check caught it
  (the Docker VM answered where it should have timed out).
- **Test before moving.** The fallback was tested as a separate resource (login and the node shell over WebSocket)
  instead of re-pointing the working Proxmox resource.

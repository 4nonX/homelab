# Architecture

State: November 2026. Addresses use placeholders: `*.lan` host names, `192.0.2.x` (documentation range) and
`example.com`.

## Host and guests

One Proxmox VE 9 host. Each concern gets its own guest, so a compromise or a broken update in one does not take the
others along.

| Guest | Type | Role |
|---|---|---|
| `docker` | VM | Docker Engine and the Komodo Periphery agent. Runs all 33 stacks. |
| `komodo` | VM | Komodo Core (+ MongoDB). Decides what to deploy, talks to Periphery outbound-only from the Docker VM. |
| `bao` | LXC | OpenBao with Raft storage. Holds every stack secret. Firewalled to SSH and the API from the LAN. |
| `samba` | LXC | SMB3 shares on ZFS datasets; ZFS snapshots show up as Windows "Previous Versions". |
| `access` | LXC | A second newt with an egress allowlist: the fallback way into the admin UIs when the Docker VM is down ([platform/access/](../platform/access/README.md)). |

VMs are provisioned with cloud-init (root login by SSH key only, no password) and run the QEMU guest agent, so the
host can run commands inside them (`qm guest exec`) without a login. That is the recovery path when a guest's own
login is lost. For the case where even the agent or the network is gone, the VMs get a graphical console with a
console-only root password ([platform/proxmox/](../platform/proxmox/README.md#graphical-console-for-the-vms)).

## Storage

```
ZFS pool "mainpool" (host)
  ├─ documents, immich-library, nextcloud-data, websites, media   datasets, shared into the Docker VM via virtiofs
  ├─ backups/openbao                                               OpenBao Raft snapshots (bind-mounted into LXC bao)
  └─ vm/vm-100-disk-0                                              zvol = Docker VM data disk: /srv/appdata + Docker
```

- App state (databases, configs) lives in `/srv/appdata/<app>` on the Docker VM's data disk. Bind mounts with absolute
  paths, so a stack's data does not depend on its compose project name.
- User content that is large or shared with Samba (photos, files, media) lives directly on ZFS datasets.
- Guest system disks are on the host's SSD (LVM thin) and are not part of the snapshot policy. The thin pool grows by
  itself before it can fill up ([platform/proxmox/](../platform/proxmox/README.md#thin-pool-for-the-guest-system-disks-autoextend)).

See [data-protection.md](data-protection.md).

## Network and routing

```
client ──> https://app.example.com
            │
            ├─ from the internet: DNS ─> VPS (Pangolin) ─> WireGuard ─> newt (Docker VM) ─┐
            └─ from the LAN:      DNS ─> internal Traefik ───────────────────────────────┤
                                                                                         ▼
                                     traefik-internal (Docker VM, wildcard certificate via DNS challenge)
                                       ├─ "open"      app does its own login (OIDC / native / sync clients)
                                       ├─ "auth"      authentik forward-auth first
                                       └─ "auth-api"  forward-auth except /api (API-key clients)
                                                     ▼
                                               app container
```

- Pangolin routes every public hostname to the same target, the internal Traefik, with the hostname as TLS server
  name. There is exactly one place that decides authentication: the route table in
  [stacks/traefik-internal/gen.py](../stacks/traefik-internal/gen.py).
- Traefik trusts `X-Forwarded-For` only from the Docker address range (the newt container), so apps see the real
  client address.
- Admin interfaces that are not apps (the Proxmox UI, Komodo) are published through Pangolin only when needed, behind
  Pangolin's own SSO with 2FA, and removed again afterwards. A fallback Proxmox resource runs through a second newt
  in LXC `access`, so it stays reachable when the Docker VM, and with it the first tunnel, is down.
- Docker address pools are moved off the LAN range (`daemon.json`), so container networks never collide with home
  subnets.

## Deployment control

Komodo Core holds the stack definitions (git mode, one stack per `stacks/<name>` folder) and a procedure that runs
every 5 minutes. Periphery on the Docker VM clones the repository with a read-only deploy key and runs the compose
commands. Full flow: [gitops-pipeline.md](gitops-pipeline.md).

## Identity

authentik is the single sign-on for every app that supports OIDC. Apps get local accounts only as a fallback for the
case that authentik itself is down; the tool needed to fix authentik must never depend on it.

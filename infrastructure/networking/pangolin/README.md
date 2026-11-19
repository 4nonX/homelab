# Pangolin edge (VPS)

Everything that is reachable from the internet goes through one small cloud VPS running
[Pangolin](https://github.com/fosrl/pangolin). The home line sits behind the ISP's carrier-grade NAT and has no open
port at all; the homelab dials out to the VPS and the VPS hands requests back through that tunnel.

Config files that run on the VPS, sanitized: [vps/](vps/). Related pages: [Traefik](../traefik/README.md) (both proxy
layers), [CrowdSec](../../security/crowdsec/README.md) (blocking on the VPS).

## Components

| Container | Image | Role |
|---|---|---|
| `pangolin` | `fosrl/pangolin` (EE, SQLite) | control plane: resources, sites, users, SSO, generates Traefik's routes |
| `gerbil` | `fosrl/gerbil` | WireGuard endpoint for sites (51820/udp) and clients (21820/udp); owns the public ports |
| `traefik` | `traefik:v3` | TLS (Let's Encrypt), HTTP/3, middlewares; runs in Gerbil's network namespace |
| `crowdsec` | `crowdsecurity/crowdsec` | reads Traefik's access log, decides bans; Traefik enforces them |

Published on the VPS: **80/tcp, 443/tcp+udp, 51820/udp, 21820/udp**, the four ports Pangolin documents as required.
Pangolin's own ports (3000-3002) stay on the Docker network, as in the official installer; Traefik and Gerbil reach
Pangolin by container name. Compose file: [vps/docker-compose.yml](vps/docker-compose.yml).

## Traffic flow

```
client ──HTTPS──> VPS :443  Traefik
                            ├─ crowdsec middleware     banned IP? -> 403 (fail-open if CrowdSec is down)
                            ├─ security headers        HSTS (2 years, preload), nosniff, referrer policy
                            └─ badger (Pangolin auth)  resource policy: public / Pangolin SSO / country rules
                     │
                     │  WireGuard (Gerbil <-> newt), opened from home, outbound
                     ▼
Docker VM: newt ──HTTPS──> traefik-internal :443 (hostname as TLS server name)
                            └─ authentik forward-auth where gen.py says so -> app
```

**One target for every resource.** Each Pangolin resource points at the internal Traefik with the public hostname as
TLS server name. The internal Traefik serves the LAN with the same routes, so an app behaves the same from the sofa
and from a hotel; which apps get authentik in front is decided once, in
[gen.py](../../../stacks/traefik-internal/gen.py). Pangolin's own SSO (with 2FA) sits additionally in front of the
few admin resources (hypervisor UI, deployment UI, design tool). Apps with native mobile or sync clients
(Nextcloud, Immich, Emby, Audiobookshelf, ...) stay without Pangolin SSO on purpose: those clients cannot complete a
browser login, and the apps have their own (OIDC) login.

**newt** runs as the stack [newt](../../../stacks/newt/) on the Docker VM. A second newt in LXC `access` is a site of its
own and carries only a fallback resource for the Proxmox UI ([platform/access/](../../../platform/access/README.md)). Because the home line is behind CGNAT, its
public address is shared and changes without notice; nothing depends on it except the CrowdSec allowlist, which reads
newt's current endpoint from Pangolin's database ([CrowdSec](../../security/crowdsec/README.md#the-home-line)).

## VPS hardening

| Area | Setting | File |
|---|---|---|
| SSH | Fail2Ban `sshd` jail on the journal: 10 failures in 10 min, ban 10 min doubling per repeat up to 1 week (`bantime.increment`); the Tailscale range is never banned | [vps/fail2ban-10-local.conf](vps/fail2ban-10-local.conf) |
| SSH | `MaxAuthTries 3`, `LoginGraceTime 20`, in a drop-in that sorts before cloud-init's | [vps/sshd-10-hardening.conf](vps/sshd-10-hardening.conf) |
| Ways in | Tailscale on the VPS and the provider's web console, independent of public SSH | |
| Memory | 2 GB swap file, `vm.swappiness=10` (Pangolin alone takes ~0.7 GB of 2 GB RAM) | |
| Logs | Traefik access log rotated daily, 7 kept (Pangolin's documented logrotate config) | [vps/logrotate-pangolin-traefik](vps/logrotate-pangolin-traefik) |
| Exposure | only the four Pangolin ports published, see above | |

## Backup

Hourly restic run on the VPS ([vps/backup/](vps/backup/)), to its own SFTP sub-account on the same off-site
storage box as the homelab backup, but with its own key, folder and repository password: a compromised VPS cannot
reach the homelab's backup.

- **Consistent database.** `sqlite3 .backup` copies the live database through SQLite's online backup API while
  Pangolin keeps running, `PRAGMA quick_check` verifies the copy, and only the copy is backed up.
- **What:** the Pangolin folder (compose file, `config.yml`, Traefik config, certificates, CrowdSec config, GeoIP
  data) plus the database copy. **Not:** the live database files, the access log.
- **Retention** 24 hourly, 7 daily, 4 weekly, 6 monthly; weekly `restic check` that reads all stored data (the
  repository is about 70 MB). A failed run or check mails the journal excerpt through a local postfix relay
  ([vps/backup/mail-relay-setup.sh](vps/backup/mail-relay-setup.sh)); successful runs stay silent.
- **Verified** after the first run: full read-back without errors, and the database copy on the box hashes
  identical to the one on the VPS.

This replaced Litestream replicating the database to object storage. Two reasons: Litestream 0.5 dropped client-side
encryption, so the database (users, password hashes, sessions) sat unencrypted in the bucket; and it had been failing
every five minutes for about seven weeks without anybody noticing, because nothing alerted on it. The new job alerts on
the first failure.

## Lessons from running it

- **Swap on small VPSes.** Without swap, a package install plus a container recreate pushed the 2 GB VPS into
  page-cache thrashing: 90 % I/O wait, Docker unresponsive, only a reboot helped. A 2 GB swap file ends that class of
  problem and leaves room for CrowdSec.
- **Read the installer defaults.** Pangolin's CrowdSec template blocks *every* request when CrowdSec is unreachable
  (`live` mode, `updateMaxFailure: 0`, AppSec `...UnreachableBlock: true`), trusts forwarded headers from
  `0.0.0.0/0` and publishes the metrics port. The edge here fails open instead; details on the
  [CrowdSec page](../../security/crowdsec/README.md).
- **Monitor the backup, not just schedule it.** See Litestream above.

Earlier designs for this edge (two-VPS failover, a Raspberry Pi relay, Terraform with a MinIO state backend, upgrade
notes for Pangolin 1.14) are kept in [legacy/](../../../legacy/README.md#pangolin-and-remote-access-designs).

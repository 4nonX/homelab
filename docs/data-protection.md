# Data protection

State: November 2026.

## Where data lives

| Location (Docker VM) | Backed by | Snapshot template |
|---|---|---|
| `/srv/appdata/<app>` (databases, configs) | ext4 data disk = zvol `mainpool/vm/...` | important |
| Docker named volumes (three stacks) | same disk | important |
| `/media/mainpool/nextcloud-data` | ZFS dataset | important |
| `/media/mainpool/immich-library` | ZFS dataset | important |
| `/media/mainpool/websites` | ZFS dataset | important |
| `/media/mainpool/media` (library + downloads) | ZFS dataset | short |
| `mainpool/documents` (Samba only) | ZFS dataset | daily |
| `mainpool/backups/openbao` (Raft snapshots) | ZFS dataset | important |

Snapshot templates ([sanoid.conf](../platform/proxmox/sanoid.conf)):

| Template | Hourly | Daily | Monthly |
|---|---|---|---|
| important | 48 | 30 | 6 |
| daily | - | 30 | 6 |
| short | - | 14 | - |

## Restoring

- **A file on a dataset:** copy it out of `/<dataset>/.zfs/snapshot/<name>/` on the host, or use "Previous Versions"
  on the Samba share.
- **A whole dataset:** `zfs rollback`.
- **One app on the Docker VM:** its data is inside a zvol, so: clone the zvol snapshot, mount it read-only, stop the
  stack, copy `/srv/appdata/<app>` back, start the stack.
- **OpenBao:** restore a Raft snapshot (`bao operator raft snapshot restore`).

Databases are snapshotted while running. That is crash-consistent, the same as a power cut: PostgreSQL and MariaDB
recover on start (seen in practice after an unplanned restart: automatic recovery, ready a minute later).

## What is not covered yet

- **No off-site copy.** A lost pool or a lost host takes the snapshots along. This is a deliberate deferral until a
  dedicated backup NAS exists. Without the media library, everything irreplaceable is small (roughly 70 GB), so the
  later backup target does not need to be large.
- **No Proxmox backup jobs.** Guest system disks (Docker VM OS, the Komodo VM with its database, the OpenBao and Samba
  containers) are on the host SSD and not snapshotted. OpenBao's data is covered by its own daily Raft snapshot on
  ZFS; Komodo's resources are exported to the GitOps repository and can be rebuilt from there.
- **No database dumps.** Restores rely on crash-consistent snapshots, not on `pg_dump`.

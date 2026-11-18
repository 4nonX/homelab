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

## Off-site backup

A nightly job on the Proxmox host ([platform/proxmox/backup/](../platform/proxmox/backup/)) copies everything
irreplaceable to a storage box at a European provider, outside the house and outside US jurisdiction.

- **Consistent point in time.** One `zfs snapshot` call covers every dataset and the Docker VM's data disk together.
  The zvol snapshot is cloned read-only and its ext4 file system mounted with `ro,noload` (no journal replay), so
  the running VM is never touched.
- **Encrypted before it leaves.** restic encrypts and deduplicates on the host; the box only stores encrypted packs.
  The target is reached over SFTP with a dedicated key, a pinned host key and a sub-account locked to its own folder.
- **What:** documents, photo library (without regenerable thumbnails and transcodes), Nextcloud files, websites,
  all app data and named volumes, OpenBao Raft snapshots. **Not:** the media library (replaceable), guest system disks.
- **Retention:** 7 daily, 4 weekly, 6 monthly; prune weekly.
- **Checks:** every Sunday `restic check` downloads and decrypts a 5 % sample of the stored data. Verification
  without touching production: `restic dump` of a file piped into `sha256sum`, compared with the live file.
- **Alerting:** a systemd `OnFailure` unit mails the journal excerpt; successful runs stay silent.
- **Size:** about 80 GB read, 46 GB stored after deduplication and compression (November 2026). The first upload
  took three hours; nightly runs only send changes.
- **Portable:** the target is one line in the env file. A storage-agnostic repository format means moving providers
  is `restic copy`, not a re-upload of history.

A first attempt used a consumer cloud drive through an unofficial API; it failed on upload drafts, server errors and
hung requests within a day. A plain SFTP target has none of those moving parts.

### The Pangolin VPS

The VPS outside the house backs up its own state (Pangolin's database, config, certificates, CrowdSec config) every
hour with restic to its own account on the same storage box: its own key, folder and repository password, so the VPS
cannot reach the homelab's repository. The SQLite database is copied through SQLite's online backup API and checked
with `quick_check` before upload; a weekly `restic check` reads all stored data. Details and files:
[infrastructure/networking/pangolin/](../infrastructure/networking/pangolin/README.md#backup).

## Restoring

- **A file on a dataset:** copy it out of `/<dataset>/.zfs/snapshot/<name>/` on the host, or use "Previous Versions"
  on the Samba share.
- **A whole dataset:** `zfs rollback`.
- **Anything, after losing the pool or the host:** `restic restore` from the off-site copy on any machine with
  restic, the SFTP access and the repository password.
- **One app on the Docker VM:** its data is inside a zvol, so: clone the zvol snapshot, mount it read-only, stop the
  stack, copy `/srv/appdata/<app>` back, start the stack.
- **OpenBao:** restore a Raft snapshot (`bao operator raft snapshot restore`).

Databases are snapshotted while running. That is crash-consistent, the same as a power cut: PostgreSQL and MariaDB
recover on start (seen in practice after an unplanned restart: automatic recovery, ready a minute later).

## What is not covered yet

- **No Proxmox backup jobs.** Guest system disks (Docker VM OS, the Komodo VM with its database, the OpenBao and Samba
  containers) are on the host SSD and not snapshotted. OpenBao's data is covered by its own daily Raft snapshot on
  ZFS; Komodo's resources are exported to the GitOps repository and can be rebuilt from there.
- **No database dumps.** Restores rely on crash-consistent snapshots, not on `pg_dump`.

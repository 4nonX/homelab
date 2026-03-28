# Storage

## Current state (in migration)

| Attribute | Value |
|---|---|
| Total capacity | 33 TB usable |
| Filesystem | BTRFS |
| RAID | mdadm RAID5 (software) |
| Drives | 4Ã- HDD |
| Block device | `/dev/md0` |
| OS drive | 120 GB NVMe (ext4) |

This is the legacy configuration inherited from ZimaOS. It is being migrated to ZFS as part of the move to NixOS + DPlaneOS. See [Migration](#migration) below.

---

## Target state: ZFS via DPlaneOS

I'm moving everything to ZFS, managed through [DPlaneOS](https://github.com/4nonX/DPlaneOS) - a NAS management layer I've been building on top of NixOS.

BTRFS RAID5 has a nasty "write-hole" problem. If the power goes out while it's writing a stripe, you can end up with corrupt parity that BTRFS can't detect. For a 33TB array, that's a risk I'm not willing to take.

ZFS (RAID-Z2) handles this much better. It guarantees consistency even during power loss, and every single block is checksummed. If a bit flips or a drive starts failing silently, the scrub will catch it and repair it from parity automatically.

### Target pool layout

```
zpool: mainpool  (RAID-Z2, 4Ã- HDD)
â”œâ”€â”€ mainpool/appdata       # /DATA/AppData - container volumes
â”œâ”€â”€ mainpool/media         # /DATA/Media   - media library
â”œâ”€â”€ mainpool/home          # user home directories
â””â”€â”€ mainpool/backups       # local snapshot targets

zpool: bootpool  (mirror, NVMe)
â””â”€â”€ NixOS system root
```

Datasets use:
- `compression=zstd`: saves space with minimal CPU hit.
- `atime=off`: stops unnecessary writes every time a file is read.
- `xattr=sa`: better performance for apps like Nextcloud and Paperless.
- `recordsize=1M`: tuned for large media files to improve read speeds.

### DPlaneOS

[DPlaneOS](https://github.com/4nonX/DPlaneOS) is the NAS management layer running on top of NixOS + ZFS. It handles:
- ZFS pool and dataset management
- SMB/NFS share provisioning
- Docker orchestration
- User management
- Web UI

The homelab services in this repo run on top of DPlaneOS. Refer to the [DPlaneOS repository](https://github.com/4nonX/DPlaneOS) for pool configuration, dataset layout details, and the NixOS module definitions that replace the manual setup documented here.

---

## Migration

**From:** BTRFS on mdadm RAID5 (ZimaOS)  
**To:** ZFS RAID-Z2 (NixOS + DPlaneOS)

The full migration plan is in [docs/NIXOS-MIGRATION.md](../../docs/NIXOS-MIGRATION.md). The storage migration is Phase 4 - last, because all running services depend on it.

### Migration approach

An in-place migration of 33 TB is not feasible without a staging array. The plan:

1. Bring up NixOS + DPlaneOS on the NVMe boot drive (parallel to existing ZimaOS install)
2. Create the new ZFS pool on the existing HDDs requires a full data copy first - the array must be rebuilt
3. Rsync all data from the BTRFS array to temporary storage (external drives or secondary server)
4. Destroy the mdadm/BTRFS array, create ZFS RAID-Z2 pool via DPlaneOS
5. Rsync data back, verify checksums against pre-migration hashes
6. Decommission ZimaOS boot

Risk: Step 3-5 is the danger window. Mitigations: pre-migration `sha256sum` manifests, BTRFS snapshot before any destructive operation, keep ZimaOS bootable until Step 6 is verified.

---

## Backup strategy

- ZFS snapshots: handles hourly/daily/weekly backups automatically.
- `zfs send`: planned for off-site replication.
- Syncthing: keeps a secondary copy of important configs.

See [docs/hardware-specs.md](../../docs/hardware-specs.md) for hardware detail.


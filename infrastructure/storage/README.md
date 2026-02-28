# Storage

## Current state (in migration)

| Attribute | Value |
|---|---|
| Total capacity | 33 TB usable |
| Filesystem | BTRFS |
| RAID | mdadm RAID5 (software) |
| Drives | 4× HDD |
| Block device | `/dev/md0` |
| OS drive | 120 GB NVMe (ext4) |

This is the legacy configuration inherited from ZimaOS. It is being migrated to ZFS as part of the move to NixOS + D-PlaneOS. See [Migration](#migration) below.

---

## Target state — ZFS via D-PlaneOS

The migration targets ZFS for all storage, managed through [D-PlaneOS](https://github.com/4nonX/D-PlaneOS) — a self-developed NAS management layer purpose-built on NixOS.

### Why ZFS over BTRFS RAID5

BTRFS RAID5 has a well-documented write-hole problem: a power loss during a RAID5 stripe write can result in an inconsistent parity state that BTRFS cannot detect or recover from. This is a known upstream issue that has not been resolved. For a 33 TB production array holding primary data, this is an unacceptable risk.

ZFS addresses this at the design level:

| Property | ZFS | BTRFS RAID5 |
|---|---|---|
| Write-hole vulnerability | No — ZIL + CoW guarantee consistency | Yes — unresolved upstream issue |
| End-to-end checksumming | Yes — data + metadata, all levels | Yes |
| Self-healing | Yes — scrub detects and repairs from parity | Partial — parity repair unreliable |
| Snapshot/clone | Yes — instantaneous, space-efficient | Yes |
| Native encryption | Yes — per-dataset, AES-256-GCM | No (relies on dm-crypt) |
| RAID-Z2 (dual parity) | Yes — double disk fault tolerance | No stable equivalent |
| Production track record | 15+ years, enterprise validated | RAID5/6 still experimental |
| Send/receive replication | Yes — incremental, stream-based | Limited |

RAID-Z2 (the ZFS equivalent) provides dual-disk fault tolerance with no write-hole. Combined with ZFS's end-to-end data integrity model — every block checksummed, scrubs verify the full tree, silent corruption repaired automatically from parity — this is the correct choice for a long-lived NAS.

### Target pool layout

```
zpool: mainpool  (RAID-Z2, 4× HDD)
├── mainpool/appdata       # /DATA/AppData — container volumes
├── mainpool/media         # /DATA/Media   — media library
├── mainpool/home          # user home directories
└── mainpool/backups       # local snapshot targets

zpool: bootpool  (mirror, NVMe)
└── NixOS system root
```

Datasets use:
- `compression=zstd` — transparent, adaptive compression
- `atime=off` — eliminates unnecessary write amplification on reads
- `xattr=sa` — stores extended attributes in inodes (Nextcloud, Paperless performance)
- `recordsize=1M` on media datasets — aligned to large sequential reads

### D-PlaneOS

[D-PlaneOS](https://github.com/4nonX/D-PlaneOS) is the NAS management layer running on top of NixOS + ZFS. It handles:
- ZFS pool and dataset management
- SMB/NFS share provisioning
- Docker orchestration
- User management
- Web UI

The homelab services in this repo run on top of D-PlaneOS. Refer to the [D-PlaneOS repository](https://github.com/4nonX/D-PlaneOS) for pool configuration, dataset layout details, and the NixOS module definitions that replace the manual setup documented here.

---

## Migration

**From:** BTRFS on mdadm RAID5 (ZimaOS)  
**To:** ZFS RAID-Z2 (NixOS + D-PlaneOS)

The full migration plan is in [docs/NIXOS-MIGRATION.md](../../docs/NIXOS-MIGRATION.md). The storage migration is Phase 4 — last, because all running services depend on it.

### Migration approach

An in-place migration of 33 TB is not feasible without a staging array. The plan:

1. Bring up NixOS + D-PlaneOS on the NVMe boot drive (parallel to existing ZimaOS install)
2. Create the new ZFS pool on the existing HDDs requires a full data copy first — the array must be rebuilt
3. Rsync all data from the BTRFS array to temporary storage (external drives or secondary server)
4. Destroy the mdadm/BTRFS array, create ZFS RAID-Z2 pool via D-PlaneOS
5. Rsync data back, verify checksums against pre-migration hashes
6. Decommission ZimaOS boot

Risk: Step 3–5 is the danger window. Mitigations: pre-migration `sha256sum` manifests, BTRFS snapshot before any destructive operation, keep ZimaOS bootable until Step 6 is verified.

---

## Backup strategy

- ZFS snapshots: automated via D-PlaneOS (hourly/daily/weekly retention policy)
- `zfs send` replication: to secondary device (planned)
- Config/compose sync: Syncthing → secondary host (active)
- Off-site encrypted backup: planned (post-migration Phase 4)

See [docs/hardware-specs.md](../../docs/hardware-specs.md) for hardware detail.

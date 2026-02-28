# Storage Architecture

## Primary Storage Pool

| Attribute | Value |
|---|---|
| Total capacity | 33 TB (usable) |
| Filesystem | BTRFS |
| RAID level | RAID5 (mdadm software RAID) |
| Drives | 4× HDD (mixed sizes; RAID5 uses minimum common capacity) |
| Block device | `/dev/md0` |

## BTRFS Features in Active Use

**Self-healing** — On read, BTRFS detects silent corruption via checksums and rebuilds from RAID5 parity automatically.

**Copy-on-Write (CoW)** — All writes are CoW; enables atomic snapshots at near-zero cost.

**Inline compression** — `zstd` compression active on data subvolumes. Typical ratio: 1.3–1.6× on media metadata, config files, and documents.

**Checksumming** — Every data block and metadata block carries a checksum. Scrubs (`btrfs scrub`) verify the entire pool on schedule.

**Subvolumes** — Pool is subdivided into logical subvolumes per data class:
```
/dev/md0  (BTRFS RAID5)
├── @           → system root
├── @home       → user data
├── @appdata    → /DATA/AppData (container volumes)
└── @media      → /DATA/Media (media library)
```

## Performance Characteristics

| Metric | Value |
|---|---|
| Sequential read | ~400–500 MB/s (HDD-limited RAID5) |
| Sequential write | ~350–450 MB/s (parity overhead) |
| Random IOPS | ~200–300 IOPS (HDD-based) |
| BTRFS overhead | ~5–10% for CoW + checksumming |

## Boot / OS Drive

| Attribute | Value |
|---|---|
| Device | 120 GB NVMe |
| Role | OS root, swap |
| Filesystem | ext4 |

## NixOS Migration Note

Current setup uses BTRFS RAID5 on mdadm. The NixOS migration plan targets ZFS for the OS/boot pool while retaining BTRFS for the data pool. See [docs/NIXOS-MIGRATION.md](../../docs/NIXOS-MIGRATION.md).

## Backup Strategy

- Snapshotting via BTRFS snapshots (local, scheduled)
- Off-site encrypted backup: planned (Phase 3)
- Config/compose file sync: Syncthing → secondary device

See: [docs/hardware-specs.md](../../docs/hardware-specs.md) for full hardware detail.

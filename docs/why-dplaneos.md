# Why DPlaneOS: From ZimaOS to a Custom NAS Layer

> [DPlaneOS](https://github.com/4nonX/DPlaneOS) is a self-developed NAS management layer
> built on Debian + ZFS + Docker. This document explains what drove the switch from ZimaOS
> and why none of the existing options were the right fit.

---

## Starting point: ZimaOS

When this homelab was first built, ZimaOS was the right call. It's Docker-first by design,
ships with a CasaOS-based web UI, has an app store for common services, and gets you from
bare metal to running containers in under an hour. For a new setup with a handful of services,
that simplicity has real value.

The original OS selection looked like this:

| OS | Pros | Cons |
|---|---|---|
| Ubuntu Server | Flexible, familiar | Entirely manual - no management layer |
| TrueNAS | ZFS, mature NAS features | Containers are second-class citizens |
| Unraid | Easy Docker, good UI | Paid license, slower parity RAID, USB-bound license key |
| Proxmox | Full virtualization | Overkill - adds complexity without much benefit here |
| ZimaOS | Docker-first, simple UI, zero friction | Newer platform, smaller community |

ZimaOS won because it had the lowest operational overhead to get 40+ services running in
production. That was the correct decision at the time.

---

## Where ZimaOS started to break down

As the setup matured - more services, more interdependencies, more things that needed to
stay running - the limitations of an imperative, GUI-managed system became harder to ignore:

**No atomic rollbacks.** Every system update is a gamble. If a package upgrade breaks
something, the recovery path is manual and time-consuming. There's no "boot into the
previous working state" option.

**Configuration drift.** Changes made through the CasaOS UI, through the terminal, and
through Docker Compose files don't compose into a single source of truth. After months
of operation, the actual running state and any documentation of it are guaranteed to
have diverged. Rebuilding from scratch would require reverse-engineering the live system.

**No reproducibility.** Destroying and rebuilding the host to an identical state is not
tractable. There's no declarative description of the system that could be applied to
fresh hardware.

**BTRFS RAID5 write-hole.** This is a storage-layer problem, not specific to ZimaOS,
but it became impossible to accept once the array was holding 33 TB of primary data.
BTRFS RAID5 has a well-documented, unresolved write-hole vulnerability: a power loss
during a stripe write can leave parity in an inconsistent state that BTRFS cannot
detect. That's not an acceptable risk posture for a production NAS.
See [infrastructure/storage/README.md](../infrastructure/storage/README.md) for the
full ZFS vs BTRFS RAID5 comparison.

**CasaOS coupling.** ZimaOS is opinionated about how services are deployed and managed.
Anything outside the CasaOS app store model requires working around the platform rather
than with it.

---

## Why not just switch to something existing?

The obvious candidates:

**TrueNAS Scale** - Excellent ZFS integration, mature NAS features, serious data
integrity story. But containers are genuinely second-class here. The platform is
optimised for NAS workloads, not for running 40+ Docker Compose stacks. The
operational model pushes toward Kubernetes for anything beyond simple apps, which
adds significant complexity for no benefit in a homelab context.

**Unraid** â€” Good Docker UX, good community, nice UI. But it requires a paid license
($59-$129), the license is bound to a USB key (the USB becomes a single point of
failure), and its parity storage implementation is slower and less reliable than
proper RAID with a battle-tested filesystem underneath it.

**HexOS / CasaOS standalone** â€” Similar ceiling to ZimaOS. Docker-first and easy to
operate, but the same absence of atomic system management and no serious ZFS story.

**NixOS alone** â€” NixOS solves the OS-layer problems completely: declarative
configuration, atomic rollbacks, reproducible builds, no configuration drift. But
it's an OS, not a NAS management layer. It doesn't provide ZFS pool management,
SMB/NFS share provisioning, a container orchestration UI, or user management out of
the box. Building all of that on top of raw NixOS means building a management layer
anyway, which is exactly what DPlaneOS is.

The gap that existed: a system with ZFS-grade storage management, Docker-native
container orchestration, and a proper management UI, without Kubernetes complexity,
without a paid license, and without being coupled to a vendor's opinionated app store.

---

## What DPlaneOS is

[DPlaneOS](https://github.com/4nonX/DPlaneOS) fills that gap. It's a ZFS-first NAS management system built as a Go daemon (`dplaned`). It replaces the scattered management tools of the past with a unified control plane.

The underlying stack is **NixOS + ZFS + Docker Engine**:
- **Storage**: Native ZFS pool and dataset management.
- **Orchestration**: Integrated Docker Compose stack management.
- **Identity**: Built-in RBAC and audit logging.
- **Interface**: React-based UI served by nginx.

I wanted the simplicity of CasaOS with the storage capability of TrueNAS, built on a declarative OS. Pure Docker Compose, ZFS, and NixOS as the reproducible base.

The NixOS migration this homelab is currently executing will eventually run DPlaneOS
on a NixOS base rather than Debian â€” combining NixOS's declarative system management
with DPlaneOS's NAS management layer and ZFS. The homelab serves as the production
testing environment for that combination.

---

## The storage migration in brief

**Current:** BTRFS on mdadm RAID5 (inherited from ZimaOS, unacceptable long-term)  
**Target:** ZFS RAID-Z2, managed through DPlaneOS

ZFS RAID-Z2 provides dual-disk fault tolerance, eliminates the write-hole vulnerability,
and integrates directly with DPlaneOS's pool and dataset management. `zfs send` makes
replication and off-site backup straightforward in a way that BTRFS never quite delivered
on in practice.

Full migration plan: [NIXOS-MIGRATION.md](NIXOS-MIGRATION.md)  
Storage architecture detail: [../infrastructure/storage/README.md](../infrastructure/storage/README.md)

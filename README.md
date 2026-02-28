# Homelab Infrastructure

[![Status](https://img.shields.io/badge/status-production-success?style=flat-square)](https://github.com/4nonX/homelab)
[![Services](https://img.shields.io/badge/services-40+-blue?style=flat-square)](https://github.com/4nonX/homelab)
[![Storage](https://img.shields.io/badge/storage-33TB_BTRFS_RAID5-orange?style=flat-square)](https://github.com/4nonX/homelab)
[![OS](https://img.shields.io/badge/OS-NixOS-5277C3?style=flat-square&logo=nixos)](https://nixos.org)
[![NAS](https://img.shields.io/badge/NAS_layer-D--PlaneOS-blueviolet?style=flat-square)](https://github.com/4nonX/D-PlaneOS)

A reference implementation of a self-hosted home infrastructure stack: 40+ containerised services, 33 TB BTRFS RAID5 storage, zero port-forwarding. Runs on NixOS with [D-PlaneOS](https://github.com/4nonX/D-PlaneOS) as the NAS management layer.

This repo documents one specific production setup. The compose files, architecture decisions, and configuration notes are intended to be useful as a reference for anyone building something similar — not as a drop-in kit. Adapt what's relevant to your own hardware and network topology.

---

## Contents

- [Architecture](#architecture)
- [Security model](#security-model)
- [Service matrix](#service-matrix)
- [Storage strategy](#storage-strategy)
- [Repository structure](#repository-structure)
- [Tech stack](#tech-stack)
- [Cost analysis](#cost-analysis)
- [Documentation](#documentation)
- [Quick start](#quick-start)

---

## Architecture

```
Internet
  │
  ▼
VPS — IONOS, Berlin (2 vCPU / 2 GB RAM / 80 GB NVMe)
  ├─ UFW firewall        ports 80, 443, 51820 only
  ├─ CrowdSec IDS/IPS   community blocklists, Traefik bouncer
  ├─ Traefik v3          TLS 1.3 termination, Let's Encrypt
  └─ Gerbil              WireGuard endpoint (Pangolin component)
            │
            │  WireGuard tunnel — ChaCha20-Poly1305, encrypted
            ▼
Raspberry Pi 5 — local LAN hub (Pangolin brain)
  ├─ Pangolin server     identity, routing control plane
  ├─ Newt                tunnel termination
  └─ Traefik (inner)     internal routing → services
            │
            ▼
Home network — 10.XXX.0.0/24
  ├─ NAS server (10.XXX.0.1)     40+ containers, 33 TB storage
  └─ Pi-hole  (10.XXX.0.2)       DNS, ad-blocking
```

> **Key design decision:** Pangolin tunnel instead of port-forwarding means the home IP is never
> exposed, there is no dynamic DNS dependency, and the home router attack surface is zero.

Interactive diagrams: [Architecture](https://4nonx.github.io/homelab/architecture-diagram.html) · [Security layers](https://4nonx.github.io/homelab/security-diagram.html) · [Data flow](https://4nonx.github.io/homelab/dataflow-diagram.html)

---

## Security model

Defense in depth: each layer is independently hardened and does not rely on the correctness of outer layers.

```
Layer 1 — Perimeter (VPS)
  UFW: only ports 80, 443, 51820 reachable from internet
  CrowdSec: IP reputation, automated banning, community threat feeds
  DDoS mitigation: IONOS network-level

Layer 2 — Transport
  WireGuard: encrypted tunnel between VPS and home network
  TLS 1.3: enforced at both outer (VPS Traefik) and inner (Pi Traefik) layers
  Let's Encrypt: certificates auto-renewed, HSTS enabled

Layer 3 — Network isolation
  Docker bridge networks scoped per service group
  Databases not exposed to host network interface
  Services communicate only via explicitly defined networks

Layer 4 — Application
  Per-service authentication; OIDC where supported
  2FA enforced on Vaultwarden and Nextcloud
  Vaultwarden for shared credential management

Layer 5 — Data integrity
  BTRFS checksumming: silent corruption detected and repaired via RAID5 parity
  RAID5 redundancy: single-disk fault tolerance
  Scheduled scrubs verify the full pool
```

---

## Service matrix

### Media

| Service | Purpose | Compose |
|---|---|---|
| Emby | Media server | `services/media/` |
| Sonarr | TV show automation | `services/media/media-management-compose.yaml` |
| Radarr | Movie automation | `services/media/media-management-compose.yaml` |
| Lidarr | Music automation | `services/media/media-management-compose.yaml` |
| Prowlarr | Indexer management | `services/media/media-management-compose.yaml` |
| Bazarr | Subtitle automation | `services/media/media-management-compose.yaml` |
| qBittorrent | Download client (via Gluetun VPN) | `services/media/media-management-compose.yaml` |
| Gluetun | WireGuard VPN gateway for downloads | `services/media/media-management-compose.yaml` |
| SwingMusic | Self-hosted music player | `services/media/swingmusic/` |
| Navidrome | Music streaming (Subsonic API) | `services/media/navidrome/` |
| Audiobookshelf | Audiobooks + podcast server | `services/media/audiobookshelf/` |
| Pinchflat | YouTube archiver | `services/media/pinchflat/` |
| Stremio Server | Streaming add-on server | `services/media/stremio/` |

### Productivity & cloud

| Service | Purpose | Compose |
|---|---|---|
| Nextcloud + Collabora | File sync, cloud office suite | `services/productivity/compose.yaml` |
| Nextcloud Talk HPB | High-performance video call backend | `services/productivity/compose.yaml` |
| Immich | Google Photos replacement | `services/media/immich/` |
| Paperless-NGX | Document OCR and archive | `services/productivity/big-bear-paperless-ngx/` |
| Vaultwarden | Self-hosted Bitwarden server | `infrastructure/security/vaultwarden/` |
| Joplin Server | Note sync backend | `services/productivity/big-bear-joplin/` |
| Memos | Lightweight notes / journal | `services/productivity/memos/` |
| Linkwarden | Bookmark archiver with full-page capture | `services/productivity/big-bear-linkwarden/` |
| Wallos | Subscription and expense tracker | `services/productivity/big-bear-wallos/` |

### Infrastructure & management

| Service | Purpose | Compose |
|---|---|---|
| Pi-hole | Network-wide DNS + ad-blocking | `infrastructure/networking/pihole/` |
| Traefik v3 | Reverse proxy, TLS termination | VPS-managed — see `infrastructure/networking/traefik/` |
| Pangolin + Gerbil | Self-hosted WireGuard tunnel | VPS + Pi — see `infrastructure/networking/pangolin/` |
| CrowdSec | IDS/IPS, collaborative threat intel | VPS-managed — see `infrastructure/security/crowdsec/` |
| Dockge | Docker Compose management UI | `infrastructure/monitoring/big-bear-dockge/` |
| Dockpeek | Container health dashboard | `infrastructure/monitoring/big-bear-dockpeek/` |
| Scrutiny | S.M.A.R.T disk health monitoring | `infrastructure/monitoring/big-bear-scrutiny/` |
| Glances | System resource monitoring | `infrastructure/monitoring/compose.yaml` |
| Syncthing | Peer-to-peer file sync (config backup) | `services/management/syncthing/` |
| SearXNG | Self-hosted metasearch engine | `services/management/searxng/` |
| PostgreSQL (×8) | Relational database instances | Per-service |
| Redis (×3) | In-memory cache instances | Per-service |

### Development

| Service | Purpose | Location |
|---|---|---|
| D-PlaneOS portfolio app | Next.js frontend + FastAPI backend + PDF resume parser | `services/development/` |

---

## Storage strategy

> Full details: [infrastructure/storage/README.md](infrastructure/storage/README.md)

**33 TB usable capacity** — four HDDs in mdadm RAID5 with BTRFS on top.

```
/dev/md0  (BTRFS RAID5)
├── @           system root subvolume
├── @home       user home directories
├── @appdata    /DATA/AppData — all container bind-mount volumes
└── @media      /DATA/Media  — media library
```

BTRFS brings self-healing (checksums + RAID5 parity repair), copy-on-write snapshots, and `zstd` inline compression. Every data and metadata block is checksummed; weekly `btrfs scrub` validates the full pool. Silent bit-rot is caught and repaired automatically.

Performance: ~400–500 MB/s sequential read, ~350–450 MB/s sequential write (HDD-limited). BTRFS CoW overhead is ~5–10%.

The NixOS migration plan separates the OS/boot pool (ZFS, NVMe) from the data pool (BTRFS, retaining existing drives). See [docs/NIXOS-MIGRATION.md](docs/NIXOS-MIGRATION.md).

---

## Repository structure

```
homelab/
├── infrastructure/
│   ├── networking/
│   │   ├── pihole/           # Pi-hole DNS + ad-blocking (compose)
│   │   ├── traefik/          # Traefik config notes (VPS-managed)
│   │   └── pangolin/         # Pangolin tunnel docs + component map
│   ├── security/
│   │   ├── vaultwarden/      # Vaultwarden compose
│   │   └── crowdsec/         # CrowdSec notes (VPS-managed)
│   ├── monitoring/
│   │   ├── big-bear-scrutiny/  # S.M.A.R.T monitoring
│   │   ├── big-bear-dockge/    # Compose management UI
│   │   ├── big-bear-dockpeek/  # Container health dashboard
│   │   └── compose.yaml        # Glances + homelab dashboard
│   └── storage/
│       └── README.md           # BTRFS RAID5 documentation
├── services/
│   ├── media/
│   │   ├── media-management-compose.yaml  # Arr suite + Gluetun + qBittorrent
│   │   ├── audiobookshelf/
│   │   ├── immich/
│   │   ├── navidrome/
│   │   ├── pinchflat/
│   │   ├── stremio/
│   │   └── swingmusic/
│   ├── productivity/
│   │   ├── compose.yaml              # Nextcloud + Collabora + Talk HPB
│   │   ├── big-bear-joplin/
│   │   ├── big-bear-linkwarden/
│   │   ├── big-bear-paperless-ngx/
│   │   ├── big-bear-wallos/
│   │   └── memos/
│   ├── management/
│   │   ├── compose.yaml     # Stacks management compose
│   │   ├── syncthing/
│   │   └── searxng/
│   └── development/
│       └── ...              # D-PlaneOS portfolio app (Next.js + FastAPI)
├── scripts/
│   └── export-all-compose.sh
├── docs/
│   ├── hardware-specs.md
│   ├── homelab-complete-journey.md
│   ├── docker-infrastructure.md
│   ├── network-security.md
│   ├── network-remote-access.md
│   ├── media-stack.md
│   ├── productivity-services.md
│   ├── nextcloud-optimization-guide.md
│   ├── homelab-dashboard-guide.md
│   ├── pangolin-infrastructure.md
│   ├── pangolin-deployment-guide.md
│   ├── pangolin-configurations.md
│   ├── pangolin-vps-relay-guide.md
│   ├── pangolin-upgrade-guide.md
│   ├── pangolin-z-performance-tuning.md
│   ├── pangolin-traefikdashboard-guide.md
│   ├── NIXOS-MIGRATION.md
│   ├── DOCKER-SERVICES.md
│   ├── INDEX.md
│   └── *.html               # Interactive architecture diagrams
├── docker/                  # Legacy source tree — see docker/README.md
├── .env.example             # All required environment variables
└── README.md
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Operating system | NixOS — declarative, reproducible, atomic OTA |
| NAS management | D-PlaneOS v3.3.1 — ZFS/BTRFS pools, SMB/NFS, Docker, web UI |
| Container orchestration | Docker Compose |
| Reverse proxy | Traefik v3 — TLS 1.3, automatic Let's Encrypt |
| Tunnel | [Pangolin](https://github.com/fosrl/pangolin) — self-hosted WireGuard |
| Security | CrowdSec IDS/IPS |
| DNS | Pi-hole |
| Storage | BTRFS on mdadm RAID5 — 33 TB |
| Databases | PostgreSQL 14 (×8 instances), Redis Alpine (×3 instances) |
| Hardware | Intel i3-13100 / 32 GB DDR4-3200 / 120 GB NVMe |
| VPS gateway | IONOS Berlin — 2 vCPU / 2 GB / 80 GB NVMe |

---

## Cost analysis

```
Initial investment
  Hardware            €1,290
  VPS (3 yr)            €180
  Domain (3 yr)          €36
  ────────────────────────────
  Total               €1,506

Annual operating cost
  Electricity           €75    (~30 W average, €0.30/kWh)
  VPS                   €60
  Domain                €12
  ────────────────────────────
  Total                €147/yr  (€12/month)

Replaced SaaS (annual)
  Google One            €30
  Dropbox Plus         €120
  1Password             €60
  Spotify              €180
  Netflix              €156
  iCloud+               €36
  ────────────────────────────
  Total replaced       €582/yr

Net savings: €435/yr → break-even Year 4
```

---

## Documentation

| Document | Description |
|---|---|
| [Complete Journey](docs/homelab-complete-journey.md) | Full build narrative, decisions, and lessons learned |
| [Hardware Specs](docs/hardware-specs.md) | Component list, benchmarks, power draw |
| [Docker Infrastructure](docs/docker-infrastructure.md) | Container architecture and patterns |
| [Network Security](docs/network-security.md) | Security layer detail |
| [Remote Access](docs/network-remote-access.md) | VPN comparison, Pangolin vs Tailscale vs ZeroTier |
| [Pangolin Infrastructure](docs/pangolin-infrastructure.md) | Tunnel architecture deep-dive |
| [Pangolin Deployment Guide](docs/pangolin-deployment-guide.md) | Step-by-step VPS setup |
| [Pangolin Configurations](docs/pangolin-configurations.md) | Config file reference |
| [Pangolin VPS Relay](docs/pangolin-vps-relay-guide.md) | Relay server setup |
| [Pangolin Upgrade Guide](docs/pangolin-upgrade-guide.md) | Version upgrade procedures |
| [Pangolin Performance Tuning](docs/pangolin-z-performance-tuning.md) | Kernel sysctl optimisations |
| [Pangolin Traefik Dashboard](docs/pangolin-traefikdashboard-guide.md) | Dashboard configuration |
| [Media Stack](docs/media-stack.md) | Arr suite + Emby configuration |
| [Productivity Services](docs/productivity-services.md) | Nextcloud, Immich, Paperless setup |
| [Nextcloud Optimisation](docs/nextcloud-optimization-guide.md) | PostgreSQL + Redis + PHP tuning |
| [Dashboard Guide](docs/homelab-dashboard-guide.md) | Homelab dashboard setup |
| [NixOS Migration Plan](docs/NIXOS-MIGRATION.md) | ZimaOS → NixOS migration roadmap |
| [Service Index](docs/DOCKER-SERVICES.md) | Full service inventory |

---

## Quick start

```bash
# Clone
git clone https://github.com/4nonX/homelab

# Set up environment variables
cp .env.example .env
$EDITOR .env   # fill in domains, passwords, IPs

# Deploy a stack — example: Nextcloud
cd services/productivity
docker compose up -d

# Deploy monitoring
cd infrastructure/monitoring
docker compose -f compose.yaml up -d
```

For the full external access setup (Pangolin tunnel + Traefik + CrowdSec on VPS), start with [docs/pangolin-deployment-guide.md](docs/pangolin-deployment-guide.md).

---

[![D-PlaneOS](https://img.shields.io/badge/D--PlaneOS-open_source_NAS_OS-blueviolet?style=flat-square&logo=github)](https://github.com/4nonX/D-PlaneOS)

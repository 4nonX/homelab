# Homelab Infrastructure

[![Status](https://img.shields.io/badge/status-production-success?style=flat-square)](https://github.com/4nonX/homelab)
[![Services](https://img.shields.io/badge/services-40+-blue?style=flat-square)](https://github.com/4nonX/homelab)
[![Storage](https://img.shields.io/badge/storage-33TB_→_ZFS_RAID--Z2-orange?style=flat-square)](infrastructure/storage/README.md)
[![OS](https://img.shields.io/badge/OS-NixOS-5277C3?style=flat-square&logo=nixos)](https://nixos.org)
[![NAS](https://img.shields.io/badge/NAS_layer-D--PlaneOS-blueviolet?style=flat-square)](https://github.com/4nonX/D-PlaneOS)

A reference implementation of a self-hosted home infrastructure stack: 40+ containerised services, 33 TB storage, zero port-forwarding. Runs on NixOS with [D-PlaneOS](https://github.com/4nonX/D-PlaneOS) as the NAS management layer — currently migrating storage from BTRFS RAID5 to ZFS RAID-Z2.

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
  ZFS end-to-end checksumming: every block verified on read, silent corruption repaired from RAID-Z2 parity
  RAID-Z2: dual-disk fault tolerance, no write-hole vulnerability (unlike BTRFS RAID5)
  Scheduled scrubs verify the full pool
  Current: migrating from BTRFS RAID5 — see infrastructure/storage/README.md
```

---

## Service matrix

### Media

| Service | Purpose | Compose |
|---|---|---|
| Emby | Media server | `services/media/arr-suite.yml` |
| Sonarr | TV show automation | `services/media/arr-suite.yml` |
| Radarr | Movie automation | `services/media/arr-suite.yml` |
| Lidarr | Music automation | `services/media/arr-suite.yml` |
| Prowlarr | Indexer management | `services/media/arr-suite.yml` |
| Bazarr | Subtitle automation | `services/media/arr-suite.yml` |
| qBittorrent | Download client (via Gluetun VPN) | `services/media/arr-suite.yml` |
| Gluetun | WireGuard VPN gateway for downloads | `services/media/arr-suite.yml` |
| SwingMusic | Self-hosted music player | `services/media/swingmusic/swingmusic.yml` |
| Navidrome | Music streaming (Subsonic API) | `services/media/navidrome/navidrome.yml` |
| Audiobookshelf | Audiobooks + podcast server | `services/media/audiobookshelf/audiobookshelf.yml` |
| Pinchflat | YouTube archiver | `services/media/pinchflat/pinchflat.yml` |
| Stremio Server | Streaming add-on server | `services/media/stremio/stremio.yml` |

### Productivity & cloud

| Service | Purpose | Compose |
|---|---|---|
| Nextcloud + Collabora | File sync, cloud office suite | `services/productivity/nextcloud.yml` |
| Nextcloud Talk HPB | High-performance video call backend | `services/productivity/nextcloud.yml` |
| Immich | Google Photos replacement | `services/media/immich/immich.yml` |
| Paperless-NGX | Document OCR and archive | `services/productivity/big-bear-paperless-ngx/paperless.yml` |
| Vaultwarden | Self-hosted Bitwarden server | `infrastructure/security/vaultwarden/vaultwarden.yml` |
| Joplin Server | Note sync backend | `services/productivity/big-bear-joplin/joplin.yml` |
| Memos | Lightweight notes / journal | `services/productivity/memos/memos.yml` |
| Linkwarden | Bookmark archiver with full-page capture | `services/productivity/big-bear-linkwarden/linkwarden.yml` |
| Wallos | Subscription and expense tracker | `services/productivity/big-bear-wallos/wallos.yml` |

### Infrastructure & management

| Service | Purpose | Compose |
|---|---|---|
| Pi-hole | Network-wide DNS + ad-blocking | `infrastructure/networking/pihole/pihole.yml` |
| Traefik v3 | Reverse proxy, TLS termination | VPS-managed — see `infrastructure/networking/traefik/` |
| Pangolin + Gerbil | Self-hosted WireGuard tunnel | VPS + Pi — see `infrastructure/networking/pangolin/` |
| CrowdSec | IDS/IPS, collaborative threat intel | VPS-managed — see `infrastructure/security/crowdsec/` |
| Dockge | Docker Compose management UI | `infrastructure/monitoring/big-bear-dockge/dockge.yml` |
| Dockpeek | Container health dashboard | `infrastructure/monitoring/big-bear-dockpeek/dockpeek.yml` |
| Scrutiny | S.M.A.R.T disk health monitoring | `infrastructure/monitoring/big-bear-scrutiny/scrutiny.yml` |
| Glances | System resource monitoring | `infrastructure/monitoring/glances-dashboard.yml` |
| Syncthing | Peer-to-peer file sync (config backup) | `services/management/syncthing/syncthing.yml` |
| SearXNG | Self-hosted metasearch engine | `services/management/searxng/searxng.yml` |
| PostgreSQL (×8) | Relational database instances | Per-service |
| Redis (×3) | In-memory cache instances | Per-service |

### Development

| Service | Purpose | Location |
|---|---|---|
| D-PlaneOS portfolio app | Next.js frontend + FastAPI backend + PDF resume parser | `services/development/` |

---

## Storage strategy

> Full details: [infrastructure/storage/README.md](infrastructure/storage/README.md)

**33 TB across four HDDs** — currently BTRFS on mdadm RAID5 (legacy, from ZimaOS). Migrating to ZFS RAID-Z2 via [D-PlaneOS](https://github.com/4nonX/D-PlaneOS).

### Why ZFS

ZFS RAID-Z2 (dual-parity) eliminates the write-hole vulnerability present in BTRFS RAID5, provides end-to-end checksumming at every level of the storage tree, and integrates cleanly with D-PlaneOS's pool and dataset management. `zfs send` replication makes off-site backup straightforward. The 15+ year production track record in enterprise environments makes it the right choice for a long-lived NAS.

### Target pool layout

```
zpool: mainpool  (RAID-Z2, 4× HDD)
├── mainpool/appdata     /DATA/AppData — container bind-mount volumes
├── mainpool/media       /DATA/Media   — media library
├── mainpool/home        user home directories
└── mainpool/backups     local snapshot targets

zpool: bootpool  (mirror, NVMe)
└── NixOS system root
```

Pool and dataset configuration is managed through [D-PlaneOS](https://github.com/4nonX/D-PlaneOS). Refer to that repository for NixOS module definitions and dataset property details (`compression=zstd`, `xattr=sa`, `recordsize` tuning per workload).

---

## Repository structure

```
homelab/
├── infrastructure/
│   ├── networking/
│   │   ├── pihole/pihole.yml
│   │   ├── traefik/          # Traefik config notes (VPS-managed)
│   │   └── pangolin/         # Pangolin tunnel docs + component map
│   ├── security/
│   │   ├── vaultwarden/vaultwarden.yml
│   │   └── crowdsec/         # CrowdSec notes (VPS-managed)
│   ├── monitoring/
│   │   ├── big-bear-scrutiny/scrutiny.yml
│   │   ├── big-bear-dockge/dockge.yml
│   │   ├── big-bear-dockpeek/dockpeek.yml
│   │   └── glances-dashboard.yml
│   └── storage/
│       └── README.md
├── services/
│   ├── media/
│   │   ├── arr-suite.yml              # Sonarr, Radarr, Lidarr, Prowlarr, Bazarr, qBittorrent, Gluetun
│   │   ├── audiobookshelf/audiobookshelf.yml
│   │   ├── immich/immich.yml
│   │   ├── navidrome/navidrome.yml
│   │   ├── pinchflat/pinchflat.yml
│   │   ├── stremio/stremio.yml
│   │   └── swingmusic/swingmusic.yml
│   ├── productivity/
│   │   ├── nextcloud.yml              # Nextcloud, Collabora, Talk HPB, Redis, PostgreSQL
│   │   ├── big-bear-joplin/joplin.yml
│   │   ├── big-bear-linkwarden/linkwarden.yml
│   │   ├── big-bear-paperless-ngx/paperless.yml
│   │   ├── big-bear-wallos/wallos.yml
│   │   └── memos/memos.yml
│   ├── management/
│   │   ├── stacks.yml
│   │   ├── syncthing/syncthing.yml
│   │   └── searxng/searxng.yml
│   └── development/
│       ├── d-planeos-website.yml
│       ├── aptifolio.yml
│       └── aptifolio-dockge.yml
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
| NAS management | [D-PlaneOS](https://github.com/4nonX/D-PlaneOS) — ZFS pool management, SMB/NFS, Docker orchestration, web UI |
| Container orchestration | Docker Compose |
| Reverse proxy | Traefik v3 — TLS 1.3, automatic Let's Encrypt |
| Tunnel | [Pangolin](https://github.com/fosrl/pangolin) — self-hosted WireGuard |
| Security | CrowdSec IDS/IPS |
| DNS | Pi-hole |
| Storage | ZFS RAID-Z2 (target) — migrating from BTRFS on mdadm RAID5 — 33 TB |
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
docker compose -f nextcloud.yml up -d

# Deploy monitoring
cd infrastructure/monitoring
docker compose -f glances-dashboard.yml up -d
```

For the full external access setup (Pangolin tunnel + Traefik + CrowdSec on VPS), start with [docs/pangolin-deployment-guide.md](docs/pangolin-deployment-guide.md).

---

[![D-PlaneOS](https://img.shields.io/badge/D--PlaneOS-open_source_NAS_OS-blueviolet?style=flat-square&logo=github)](https://github.com/4nonX/D-PlaneOS)

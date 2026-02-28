# Homelab Infrastructure

[![Status](https://img.shields.io/badge/status-production-success?style=flat-square)](https://github.com/4nonX/homelab)
[![Services](https://img.shields.io/badge/services-40+-blue?style=flat-square)](https://github.com/4nonX/homelab)
[![Storage](https://img.shields.io/badge/storage-33TB_→_ZFS_RAID--Z2-orange?style=flat-square)](infrastructure/storage/README.md)
[![OS](https://img.shields.io/badge/OS-NixOS-5277C3?style=flat-square&logo=nixos)](https://nixos.org)
[![NAS](https://img.shields.io/badge/NAS_layer-D--PlaneOS-blueviolet?style=flat-square)](https://github.com/4nonX/D-PlaneOS)

A reference implementation of a self-hosted home infrastructure stack: 40+ containerised services, 33 TB storage, zero port-forwarding. Runs on NixOS with [D-PlaneOS](https://github.com/4nonX/D-PlaneOS) — a self-developed NAS management layer — currently migrating storage from BTRFS RAID5 to ZFS RAID-Z2.

---

> **[INDEX.md](INDEX.md)** — complete map of every file in this repository.

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

> **Key design decision:** [Pangolin](https://github.com/fosrl/pangolin) tunnel instead of port-forwarding means the home IP is never
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
| [Emby](https://emby.media) | Media server | [arr-suite.yml](services/media/arr-suite.yml) |
| [Sonarr](https://github.com/Sonarr/Sonarr) | TV show automation | [arr-suite.yml](services/media/arr-suite.yml) |
| [Radarr](https://github.com/Radarr/Radarr) | Movie automation | [arr-suite.yml](services/media/arr-suite.yml) |
| [Lidarr](https://github.com/Lidarr/Lidarr) | Music automation | [arr-suite.yml](services/media/arr-suite.yml) |
| [Prowlarr](https://github.com/Prowlarr/Prowlarr) | Indexer management | [arr-suite.yml](services/media/arr-suite.yml) |
| [Bazarr](https://github.com/morpheus65535/bazarr) | Subtitle automation | [arr-suite.yml](services/media/arr-suite.yml) |
| [qBittorrent](https://github.com/qbittorrent/qBittorrent) | Download client (via [Gluetun](https://github.com/qdm12/gluetun) VPN) | [arr-suite.yml](services/media/arr-suite.yml) |
| [Gluetun](https://github.com/qdm12/gluetun) | WireGuard VPN gateway for downloads | [arr-suite.yml](services/media/arr-suite.yml) |
| [SwingMusic](https://github.com/swingmx/swingmusic) | Self-hosted music player | [swingmusic.yml](services/media/swingmusic/swingmusic.yml) |
| [Navidrome](https://github.com/navidrome/navidrome) | Music streaming (Subsonic API) | [navidrome.yml](services/media/navidrome/navidrome.yml) |
| [Audiobookshelf](https://github.com/advplyr/audiobookshelf) | Audiobooks + podcast server | [audiobookshelf.yml](services/media/audiobookshelf/audiobookshelf.yml) |
| [Pinchflat](https://github.com/kieraneglin/pinchflat) | YouTube archiver | [pinchflat.yml](services/media/pinchflat/pinchflat.yml) |
| [Stremio Server](https://github.com/Stremio/server-docker) | Streaming add-on server | [stremio.yml](services/media/stremio/stremio.yml) |

### Productivity & cloud

| Service | Purpose | Compose |
|---|---|---|
| [Nextcloud](https://github.com/nextcloud/server) + [Collabora](https://github.com/CollaboraOnline/online) | File sync, cloud office suite | [nextcloud.yml](services/productivity/nextcloud.yml) |
| [Nextcloud Talk HPB](https://github.com/strukturag/nextcloud-spreed-signaling) | High-performance video call backend | [nextcloud.yml](services/productivity/nextcloud.yml) |
| [Immich](https://github.com/immich-app/immich) | Google Photos replacement | [immich.yml](services/media/immich/immich.yml) |
| [Paperless-NGX](https://github.com/paperless-ngx/paperless-ngx) | Document OCR and archive | [paperless.yml](services/productivity/big-bear-paperless-ngx/paperless.yml) |
| [Vaultwarden](https://github.com/dani-garcia/vaultwarden) | Self-hosted [Bitwarden](https://bitwarden.com) server | [vaultwarden.yml](infrastructure/security/vaultwarden/vaultwarden.yml) |
| [Joplin Server](https://github.com/laurent22/joplin) | Note sync backend | [joplin.yml](services/productivity/big-bear-joplin/joplin.yml) |
| [Memos](https://github.com/usememos/memos) | Lightweight notes / journal | [memos.yml](services/productivity/memos/memos.yml) |
| [Linkwarden](https://github.com/linkwarden/linkwarden) | Bookmark archiver with full-page capture | [linkwarden.yml](services/productivity/big-bear-linkwarden/linkwarden.yml) |
| [Wallos](https://github.com/ellite/Wallos) | Subscription and expense tracker | [wallos.yml](services/productivity/big-bear-wallos/wallos.yml) |

### Infrastructure & management

| Service | Purpose | Compose |
|---|---|---|
| [Pi-hole](https://github.com/pi-hole/pi-hole) | Network-wide DNS + ad-blocking | [pihole.yml](infrastructure/networking/pihole/pihole.yml) |
| [Traefik](https://github.com/traefik/traefik) v3 | Reverse proxy, TLS termination | VPS-managed — see [infrastructure/networking/traefik/](infrastructure/networking/traefik/README.md) |
| [Pangolin](https://github.com/fosrl/pangolin) + [Gerbil](https://github.com/fosrl/gerbil) | Self-hosted WireGuard tunnel | VPS + Pi — see [infrastructure/networking/pangolin/](infrastructure/networking/pangolin/README.md) |
| [CrowdSec](https://github.com/crowdsecurity/crowdsec) | IDS/IPS, collaborative threat intel | VPS-managed — see [infrastructure/security/crowdsec/](infrastructure/security/crowdsec/README.md) |
| [Dockge](https://github.com/louislam/dockge) | Docker Compose management UI | [dockge.yml](infrastructure/monitoring/big-bear-dockge/dockge.yml) |
| [Dockpeek](https://github.com/louislam/dockge) | Container health dashboard | [dockpeek.yml](infrastructure/monitoring/big-bear-dockpeek/dockpeek.yml) |
| [Scrutiny](https://github.com/AnalogJ/scrutiny) | S.M.A.R.T disk health monitoring | [scrutiny.yml](infrastructure/monitoring/big-bear-scrutiny/scrutiny.yml) |
| [Glances](https://github.com/nicolargo/glances) | System resource monitoring | [glances-dashboard.yml](infrastructure/monitoring/glances-dashboard.yml) |
| [Syncthing](https://github.com/syncthing/syncthing) | Peer-to-peer file sync (config backup) | [syncthing.yml](services/management/syncthing/syncthing.yml) |
| [SearXNG](https://github.com/searxng/searxng) | Self-hosted metasearch engine | [searxng.yml](services/management/searxng/searxng.yml) |
| [PostgreSQL](https://www.postgresql.org) (×8) | Relational database instances | Per-service |
| [Redis](https://redis.io) (×3) | In-memory cache instances | Per-service |

### Development

| Service | Purpose | Location |
|---|---|---|
| [D-PlaneOS](https://github.com/4nonX/D-PlaneOS) website | Project landing page | [d-planeos-website.yml](services/development/d-planeos-website.yml) |
| Aptifolio | [Next.js](https://nextjs.org) frontend + [FastAPI](https://fastapi.tiangolo.com) backend + PDF resume parser | [aptifolio.yml](services/development/aptifolio.yml) |

---

## Storage strategy

> Full details: [infrastructure/storage/README.md](infrastructure/storage/README.md)

**33 TB across four HDDs** — currently BTRFS on mdadm RAID5 (legacy, from ZimaOS). Migrating to ZFS RAID-Z2 via [D-PlaneOS](https://github.com/4nonX/D-PlaneOS).

### Why ZFS

[ZFS](https://github.com/openzfs/zfs) RAID-Z2 (dual-parity) eliminates the write-hole vulnerability present in BTRFS RAID5, provides end-to-end checksumming at every level of the storage tree, and integrates cleanly with [D-PlaneOS](https://github.com/4nonX/D-PlaneOS)'s pool and dataset management. `zfs send` replication makes off-site backup straightforward. The 15+ year production track record in enterprise environments makes it the right choice for a long-lived NAS.

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
| Operating system | [NixOS](https://nixos.org) — declarative, reproducible, atomic OTA |
| NAS management | [D-PlaneOS](https://github.com/4nonX/D-PlaneOS) *(self-developed)* — ZFS pool management, SMB/NFS, Docker orchestration, web UI |
| Container orchestration | [Docker Compose](https://docs.docker.com/compose/) |
| Reverse proxy | [Traefik](https://github.com/traefik/traefik) v3 — TLS 1.3, automatic Let's Encrypt |
| Tunnel | [Pangolin](https://github.com/fosrl/pangolin) — self-hosted WireGuard |
| Security | [CrowdSec](https://github.com/crowdsecurity/crowdsec) IDS/IPS |
| DNS | [Pi-hole](https://github.com/pi-hole/pi-hole) |
| Storage | [OpenZFS](https://github.com/openzfs/zfs) RAID-Z2 (target) — migrating from BTRFS on mdadm RAID5 — 33 TB |
| Databases | [PostgreSQL](https://www.postgresql.org) 14 (×8 instances), [Redis](https://redis.io) Alpine (×3 instances) |
| Hardware | Intel i3-13100 / 32 GB DDR4-3200 / 120 GB NVMe |
| VPS gateway | [IONOS](https://www.ionos.de) Berlin — 2 vCPU / 2 GB / 80 GB NVMe |

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
| [Why D-PlaneOS](docs/why-d-planeos.md) | ZimaOS limitations, alternatives considered, what D-PlaneOS solves |
| [Complete Journey](docs/homelab-complete-journey.md) | Full build narrative, decisions, and lessons learned |
| [Hardware Specs](docs/hardware-specs.md) | Component list, benchmarks, power draw |
| [Docker Infrastructure](docs/docker-infrastructure.md) | Container architecture and patterns |
| [Network Security](docs/network-security.md) | Security layer detail |
| [Remote Access](docs/network-remote-access.md) | VPN comparison, [Pangolin](https://github.com/fosrl/pangolin) vs [Tailscale](https://tailscale.com) vs [ZeroTier](https://www.zerotier.com) |
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

For the full external access setup ([Pangolin](https://github.com/fosrl/pangolin) tunnel + [Traefik](https://github.com/traefik/traefik) + [CrowdSec](https://github.com/crowdsecurity/crowdsec) on VPS), start with [docs/pangolin-deployment-guide.md](docs/pangolin-deployment-guide.md).

---

## Built on the shoulders of giants

This homelab would not exist without these projects. Each one is worth knowing about.

---

### 🥇 Pangolin — the backbone of external access

> [![Pangolin](https://img.shields.io/badge/fosrl%2Fpangolin-self--hosted_tunnel-FF6B35?style=flat-square&logo=github)](https://github.com/fosrl/pangolin)

The single most impactful piece of infrastructure in this stack. [Pangolin](https://github.com/fosrl/pangolin) is a self-hosted
tunnelled reverse proxy with identity and access management — think [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/), but
open source and entirely under your control.

Before Pangolin, the realistic options for external access were: open ports on your home
router (bad), pay for a commercial tunnel (fine but a dependency), or set up [WireGuard](https://www.wireguard.com)
manually and manage it yourself (works, but significant operational overhead). Pangolin
wraps [WireGuard](https://www.wireguard.com), [Traefik](https://github.com/traefik/traefik), and an identity layer into something you can actually run on a
cheap VPS and forget about. Zero port-forwarding. Zero home IP exposure. [Let's Encrypt](https://letsencrypt.org)
certificates handled automatically. The security architecture of this entire homelab is
built around what Pangolin makes possible.

Components: [Pangolin](https://github.com/fosrl/pangolin) (control plane) · [Gerbil](https://github.com/fosrl/gerbil) (WireGuard gateway) · [Newt](https://github.com/fosrl/newt) (tunnel client) · [Badger](https://github.com/fosrl/badger) (identity)

If you self-host anything that needs external access, start here.

---

### 🗄️ D-PlaneOS — the NAS management layer (self-developed)

> [![D-PlaneOS](https://img.shields.io/badge/4nonX%2FD--PlaneOS-self--developed_NAS_OS-blueviolet?style=flat-square&logo=github)](https://github.com/4nonX/D-PlaneOS)

A NAS management layer I built myself — [ZFS](https://github.com/openzfs/zfs) pool management, SMB/NFS shares, [Docker](https://www.docker.com)
orchestration, user management, and a unified web UI, purpose-built on top of [NixOS](https://nixos.org).
Developed specifically to fill the gap between [CasaOS](https://github.com/IceWhaleTech/CasaOS) (simple but limited) and
[TrueNAS](https://www.truenas.com) (powerful but container-hostile). The homelab you're looking at is its
production testing environment. See [docs/why-d-planeos.md](docs/why-d-planeos.md).

---

### 🐳 Core infrastructure

| Project | Role in this stack |
|---|---|
| [![NixOS](https://img.shields.io/badge/NixOS-nixos.org-5277C3?style=flat-square&logo=nixos)](https://nixos.org) | The OS everything runs on. Declarative system configuration, atomic rollbacks, reproducible builds — the base that makes the whole stack manageable. [D-PlaneOS](https://github.com/4nonX/D-PlaneOS) runs on top of it. |
| [![Traefik](https://img.shields.io/badge/Traefik-traefik.io-24A1C1?style=flat-square&logo=traefikproxy)](https://github.com/traefik/traefik) | Reverse proxy — TLS termination, automatic [Let's Encrypt](https://letsencrypt.org), routing. Runs on the VPS and handles every inbound HTTPS request. |
| [![CrowdSec](https://img.shields.io/badge/CrowdSec-crowdsec.net-1565C0?style=flat-square)](https://github.com/crowdsecurity/crowdsec) | Collaborative IDS/IPS. Analyses [Traefik](https://github.com/traefik/traefik) logs, bans malicious IPs via bouncer, pulls community threat feeds. The passive security layer that works without any configuration after setup. |
| [![Pi-hole](https://img.shields.io/badge/Pi--hole-pi--hole.net-CC0000?style=flat-square)](https://github.com/pi-hole/pi-hole) | Network-wide DNS and ad-blocking. Every device on the LAN benefits without any per-device configuration. |
| [![OpenZFS](https://img.shields.io/badge/OpenZFS-openzfs.org-2A7AE2?style=flat-square)](https://github.com/openzfs/zfs) | The filesystem everything is migrating to. End-to-end checksumming, RAID-Z2, snapshots, `zfs send` replication — the right foundation for a long-lived NAS. |

---

### 📦 Services

| Project | What it replaces |
|---|---|
| [![Nextcloud](https://img.shields.io/badge/Nextcloud-nextcloud.com-0082C9?style=flat-square&logo=nextcloud)](https://github.com/nextcloud/server) | Google Drive, Google Docs, iCloud |
| [![Immich](https://img.shields.io/badge/Immich-immich.app-4250AF?style=flat-square)](https://github.com/immich-app/immich) | Google Photos |
| [![Vaultwarden](https://img.shields.io/badge/Vaultwarden-github.com-175DDC?style=flat-square&logo=bitwarden)](https://github.com/dani-garcia/vaultwarden) | 1Password, LastPass |
| [![Paperless-NGX](https://img.shields.io/badge/Paperless--NGX-github.com-51CF66?style=flat-square)](https://github.com/paperless-ngx/paperless-ngx) | Manual document filing |
| [![Emby](https://img.shields.io/badge/Emby-emby.media-52B54B?style=flat-square)](https://emby.media) | Netflix, Plex (self-hosted media server) |
| [![Sonarr](https://img.shields.io/badge/Sonarr-sonarr.tv-35C5F4?style=flat-square)](https://github.com/Sonarr/Sonarr) [![Radarr](https://img.shields.io/badge/Radarr-radarr.video-FFC230?style=flat-square)](https://github.com/Radarr/Radarr) [![Lidarr](https://img.shields.io/badge/Lidarr-lidarr.audio-1DA0C2?style=flat-square)](https://github.com/Lidarr/Lidarr) | Manual media management |
| [![Prowlarr](https://img.shields.io/badge/Prowlarr-github.com-FF6600?style=flat-square)](https://github.com/Prowlarr/Prowlarr) | Per-client indexer configuration |
| [![Bazarr](https://img.shields.io/badge/Bazarr-bazarr.media-F5A623?style=flat-square)](https://github.com/morpheus65535/bazarr) | Manual subtitle hunting |
| [![Gluetun](https://img.shields.io/badge/Gluetun-github.com-3A3A3A?style=flat-square)](https://github.com/qdm12/gluetun) | Any VPN client — containerised, provider-agnostic [WireGuard](https://www.wireguard.com) gateway |
| [![Syncthing](https://img.shields.io/badge/Syncthing-syncthing.net-0891D1?style=flat-square&logo=syncthing)](https://github.com/syncthing/syncthing) | Dropbox, rsync scripts |
| [![Dockge](https://img.shields.io/badge/Dockge-github.com-5E4FCD?style=flat-square)](https://github.com/louislam/dockge) | Manual `docker compose` commands |
| [![Scrutiny](https://img.shields.io/badge/Scrutiny-github.com-E53935?style=flat-square)](https://github.com/AnalogJ/scrutiny) | Ignoring disk health until something fails |
| [![SearXNG](https://img.shields.io/badge/SearXNG-github.com-3050FF?style=flat-square)](https://github.com/searxng/searxng) | Google, Bing |
| [![Audiobookshelf](https://img.shields.io/badge/Audiobookshelf-audiobookshelf.org-E76F51?style=flat-square)](https://github.com/advplyr/audiobookshelf) | Audible, podcast apps |
| [![Navidrome](https://img.shields.io/badge/Navidrome-navidrome.org-FF7700?style=flat-square)](https://github.com/navidrome/navidrome) | Spotify (self-hosted music streaming) |
| [![SwingMusic](https://img.shields.io/badge/SwingMusic-github.com-7C3AED?style=flat-square)](https://github.com/swingmx/swingmusic) | Local music player apps |
| [![Pinchflat](https://img.shields.io/badge/Pinchflat-github.com-FF0000?style=flat-square)](https://github.com/kieraneglin/pinchflat) | YouTube Premium downloads |
| [![Linkwarden](https://img.shields.io/badge/Linkwarden-linkwarden.app-6B46C1?style=flat-square)](https://github.com/linkwarden/linkwarden) | Browser bookmarks, Pocket |
| [![Memos](https://img.shields.io/badge/Memos-usememos.com-FFCB47?style=flat-square)](https://github.com/usememos/memos) | Notion, Apple Notes |
| [![Wallos](https://img.shields.io/badge/Wallos-github.com-4CAF50?style=flat-square)](https://github.com/ellite/Wallos) | Manual subscription tracking |
| [![Glances](https://img.shields.io/badge/Glances-nicolargo.github.io-00ACD7?style=flat-square)](https://github.com/nicolargo/glances) | Scattered system monitoring tools |
| [![Joplin](https://img.shields.io/badge/Joplin-joplinapp.org-1071D3?style=flat-square)](https://github.com/laurent22/joplin) | Evernote, Apple Notes (sync backend) |

---

[![D-PlaneOS](https://img.shields.io/badge/D--PlaneOS-open_source_NAS_OS-blueviolet?style=flat-square&logo=github)](https://github.com/4nonX/D-PlaneOS)
[![Pangolin](https://img.shields.io/badge/Pangolin-self--hosted_tunnel-orange?style=flat-square&logo=github)](https://github.com/fosrl/pangolin)

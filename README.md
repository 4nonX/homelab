<p align="center">
  <a href="https://github.com/4nonX/DPlaneOS">
    <img src="https://raw.githubusercontent.com/4nonX/DPlaneOS/main/assets/dplaneos-logo.png" width="400" alt="DPlaneOS Logo">
  </a>
</p>

# Homelab Infrastructure

[![Status](https://img.shields.io/badge/status-production-success?style=flat-square)](https://github.com/4nonX/homelab)
[![Services](https://img.shields.io/badge/services-30+-blue?style=flat-square)](https://github.com/4nonX/homelab)
[![Storage](https://img.shields.io/badge/storage-33TB_->ZFS_RAID--Z2-orange?style=flat-square)](infrastructure/storage/README.md)
[![OS](https://img.shields.io/badge/OS-NixOS-5277C3?style=flat-square&logo=nixos)](https://nixos.org)
[![NAS](https://img.shields.io/badge/NAS_layer-DPlaneOS-blueviolet?style=flat-square)](https://github.com/4nonX/DPlaneOS)

A reference implementation of a self-hosted home infrastructure stack: 60+ containerised services, 33 TB storage, zero port-forwarding. Runs on NixOS with [DPlaneOS](https://github.com/4nonX/DPlaneOS) - a self-developed NAS management layer - currently migrating storage from BTRFS RAID5 to ZFS RAID-Z2.

---

> **[INDEX.md](INDEX.md)** - complete map of every file in this repository.

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
  Ã¢â€â€š
  Ã¢â€“Â¼
VPS - IONOS, Berlin (2 vCPU / 2 GB RAM / 80 GB NVMe)
  Ã¢â€Å“Ã¢â€â‚¬ UFW firewall        ports 80, 443, 51820 only
  Ã¢â€Å“Ã¢â€â‚¬ CrowdSec IDS/IPS   community blocklists, Traefik bouncer
  Ã¢â€Å“Ã¢â€â‚¬ Traefik v3          TLS 1.3 termination, Let's Encrypt
  Ã¢â€â€Ã¢â€â‚¬ Gerbil              WireGuard endpoint (Pangolin component)
            Ã¢â€â€š
            Ã¢â€â€š  WireGuard tunnel - ChaCha20-Poly1305, encrypted
            Ã¢â€“Â¼
Raspberry Pi 5 - local LAN hub (Pangolin brain)
  Ã¢â€Å“Ã¢â€â‚¬ Pangolin server     identity, routing control plane
  Ã¢â€Å“Ã¢â€â‚¬ Newt                tunnel termination
  Ã¢â€â€Ã¢â€â‚¬ Traefik (inner)     internal routing Ã¢â€ â€™ services
            Ã¢â€â€š
            Ã¢â€“Â¼
Home network - 10.XXX.0.0/24
  Ã¢â€Å“Ã¢â€â‚¬ NAS server (10.XXX.0.1)     40+ containers, 33 TB storage
  Ã¢â€â€Ã¢â€â‚¬ Pi-hole  (10.XXX.0.2)       DNS, ad-blocking
```

> **Note on tunnel design:** Using a [Pangolin](https://github.com/fosrl/pangolin) tunnel instead of port-forwarding means the home IP is never
> exposed, there is no dynamic DNS dependency, and the home router attack surface is zero.

Interactive diagrams: [Architecture](https://4nonx.github.io/homelab/architecture-diagram.html) Ã‚Â· [Security layers](https://4nonx.github.io/homelab/security-diagram.html) Ã‚Â· [Data flow](https://4nonx.github.io/homelab/dataflow-diagram.html)

---

## Security model

Defense in depth: each layer is independently hardened and does not rely on the correctness of outer layers.

```
Layer 1 - Perimeter (VPS)
  UFW: only ports 80, 443, 51820 reachable from internet
  CrowdSec: IP reputation, automated banning, community threat feeds
  DDoS mitigation: IONOS network-level

Layer 2 - Transport
  WireGuard: encrypted tunnel between VPS and home network
  TLS 1.3: enforced at both outer (VPS Traefik) and inner (Pi Traefik) layers
  Let's Encrypt: certificates auto-renewed, HSTS enabled

Layer 3 - Network isolation
  Docker bridge networks scoped per service group
  Databases not exposed to host network interface
  Services communicate only via explicitly defined networks

Layer 4 - Application
  Per-service authentication; OIDC where supported
  2FA enforced on Vaultwarden and Nextcloud
  Vaultwarden for shared credential management

Layer 5 - Data integrity
  ZFS end-to-end checksumming: every block verified on read, silent corruption repaired from RAID-Z2 parity
  RAID-Z2: dual-disk fault tolerance, no write-hole vulnerability (unlike BTRFS RAID5)
  Scheduled scrubs verify the full pool
  Current: migrating from BTRFS RAID5 - see infrastructure/storage/README.md
```

---

## Service matrix

### Media

| Service | Purpose | Compose |
|---|---|---|
| [![Emby](https://img.shields.io/badge/Emby-emby.media-52B54B?style=flat-square)](https://emby.media) | Media server | [arr-suite.yml](services/media/arr-suite.yml) |
| [![Sonarr](https://img.shields.io/badge/Sonarr-sonarr.tv-35C5F4?style=flat-square)](https://github.com/Sonarr/Sonarr) | TV show automation | [arr-suite.yml](services/media/arr-suite.yml) |
| [![Radarr](https://img.shields.io/badge/Radarr-radarr.video-FFC230?style=flat-square)](https://github.com/Radarr/Radarr) | Movie automation | [arr-suite.yml](services/media/arr-suite.yml) |
| [![Lidarr](https://img.shields.io/badge/Lidarr-lidarr.audio-1DA0C2?style=flat-square)](https://github.com/Lidarr/Lidarr) | Music automation | [arr-suite.yml](services/media/arr-suite.yml) |
| [![Prowlarr](https://img.shields.io/badge/Prowlarr-github.com-FF6600?style=flat-square)](https://github.com/Prowlarr/Prowlarr) | Indexer management | [arr-suite.yml](services/media/arr-suite.yml) |
| [![Bazarr](https://img.shields.io/badge/Bazarr-bazarr.media-F5A623?style=flat-square)](https://github.com/morpheus65535/bazarr) | Subtitle automation | [arr-suite.yml](services/media/arr-suite.yml) |
| [![qBittorrent](https://img.shields.io/badge/qBittorrent-qbittorrent.org-2F67BA?style=flat-square)](https://github.com/qbittorrent/qBittorrent) | Download client (via [Gluetun](https://github.com/qdm12/gluetun) VPN) | [arr-suite.yml](services/media/arr-suite.yml) |
| [![Gluetun](https://img.shields.io/badge/Gluetun-github.com-3A3A3A?style=flat-square)](https://github.com/qdm12/gluetun) | WireGuard VPN gateway for downloads | [arr-suite.yml](services/media/arr-suite.yml) |
| [![SwingMusic](https://img.shields.io/badge/SwingMusic-github.com-7C3AED?style=flat-square)](https://github.com/swingmx/swingmusic) | Self-hosted music player | [swingmusic.yml](services/media/swingmusic/swingmusic.yml) |
| [![Navidrome](https://img.shields.io/badge/Navidrome-navidrome.org-FF7700?style=flat-square)](https://github.com/navidrome/navidrome) | Music streaming (Subsonic API) | [navidrome.yml](services/media/navidrome/navidrome.yml) |
| [![Audiobookshelf](https://img.shields.io/badge/Audiobookshelf-audiobookshelf.org-E76F51?style=flat-square)](https://github.com/advplyr/audiobookshelf) | Audiobooks + podcast server | [audiobookshelf.yml](services/media/audiobookshelf/audiobookshelf.yml) |
| [![Pinchflat](https://img.shields.io/badge/Pinchflat-github.com-FF0000?style=flat-square)](https://github.com/kieraneglin/pinchflat) | YouTube archiver | [pinchflat.yml](services/media/pinchflat/pinchflat.yml) |
| [![Stremio](https://img.shields.io/badge/Stremio-stremio.com-6B46C1?style=flat-square)](https://github.com/Stremio/server-docker) | Streaming add-on server | [stremio.yml](services/media/stremio/stremio.yml) |

### Productivity & cloud

| Service | Purpose | Compose |
|---|---|---|
| [![Nextcloud](https://img.shields.io/badge/Nextcloud-nextcloud.com-0082C9?style=flat-square&logo=nextcloud)](https://github.com/nextcloud/server) | File sync, cloud office suite | [nextcloud.yml](services/productivity/nextcloud.yml) |
| [![Collabora-Online](https://img.shields.io/badge/Collabora--Online-collaboraonline.com-4FAD4F?style=flat-square)](https://github.com/CollaboraOnline/online) | High-performance video call backend | [nextcloud.yml](services/productivity/nextcloud.yml) |
| [![Immich](https://img.shields.io/badge/Immich-immich.app-4250AF?style=flat-square)](https://github.com/immich-app/immich) | Google Photos replacement | [immich.yml](services/media/immich/immich.yml) |
| [![Paperless-ngx](https://img.shields.io/badge/Paperless--ngx-github.com-51CF66?style=flat-square)](https://github.com/paperless-ngx/paperless-ngx) | Document OCR and archive | [paperless.yml](services/productivity/big-bear-paperless-ngx/paperless.yml) |
| [![Vaultwarden](https://img.shields.io/badge/Vaultwarden-github.com-175DDC?style=flat-square&logo=bitwarden)](https://github.com/dani-garcia/vaultwarden) | Self-hosted [Bitwarden](https://bitwarden.com) server | [vaultwarden.yml](infrastructure/security/vaultwarden/vaultwarden.yml) |
| [![Joplin](https://img.shields.io/badge/Joplin-joplinapp.org-1071D3?style=flat-square)](https://github.com/laurent22/joplin) | Note sync backend | [joplin.yml](services/productivity/big-bear-joplin/joplin.yml) |
| [![Memos](https://img.shields.io/badge/Memos-usememos.com-FFCB47?style=flat-square)](https://github.com/usememos/memos) | Lightweight notes / journal | [memos.yml](services/productivity/memos/memos.yml) |
| [![Linkwarden](https://img.shields.io/badge/Linkwarden-linkwarden.app-6B46C1?style=flat-square)](https://github.com/linkwarden/linkwarden) | Bookmark archiver with full-page capture | [linkwarden.yml](services/productivity/big-bear-linkwarden/linkwarden.yml) |
| [![Wallos](https://img.shields.io/badge/Wallos-github.com-4CAF50?style=flat-square)](https://github.com/ellite/Wallos) | Subscription and expense tracker | [wallos.yml](services/productivity/big-bear-wallos/wallos.yml) |

### Infrastructure & management

| Service | Purpose | Compose |
|---|---|---|
| [![Pi-hole](https://img.shields.io/badge/Pi--hole-pi--hole.net-CC0000?style=flat-square)](https://github.com/pi-hole/pi-hole) | Network-wide DNS + ad-blocking | [pihole.yml](infrastructure/networking/pihole/pihole.yml) |
| [![Traefik](https://img.shields.io/badge/Traefik-traefik.io-24A1C1?style=flat-square&logo=traefikproxy)](https://github.com/traefik/traefik) | Reverse proxy, TLS termination | VPS-managed: see [infrastructure/networking/traefik/](infrastructure/networking/traefik/README.md) |
| [![Pangolin](https://img.shields.io/badge/fosrl%2Fpangolin-self--hosted_tunnel-FF6B35?style=flat-square&logo=github)](https://github.com/fosrl/pangolin) | Self-hosted Cloudflare Tunnel | VPS + Pi: see [infrastructure/networking/pangolin/](infrastructure/networking/pangolin/README.md) |
| [![CrowdSec](https://img.shields.io/badge/CrowdSec-crowdsec.net-1565C0?style=flat-square)](https://github.com/crowdsecurity/crowdsec) | IDS/IPS, collaborative threat intel | VPS-managed: see [infrastructure/security/crowdsec/](infrastructure/security/crowdsec/README.md) |
| [![Dockge](https://img.shields.io/badge/Dockge-github.com-5E4FCD?style=flat-square)](https://github.com/louislam/dockge) | Docker Compose management UI | [dockge.yml](infrastructure/monitoring/big-bear-dockge/dockge.yml) |
| [![DockPeek](https://img.shields.io/badge/DockPeek-github.com-51CF66?style=flat-square)](https://github.com/louislam/dockge) | Container health dashboard | [dockpeek.yml](infrastructure/monitoring/big-bear-dockpeek/dockpeek.yml) |
| [![Scrutiny](https://img.shields.io/badge/Scrutiny-github.com-E53935?style=flat-square)](https://github.com/AnalogJ/scrutiny) | S.M.A.R.T disk health monitoring | [scrutiny.yml](infrastructure/monitoring/big-bear-scrutiny/scrutiny.yml) |
| [![Glances](https://img.shields.io/badge/Glances-nicolargo.github.io-00ACD7?style=flat-square)](https://github.com/nicolargo/glances) | System resource monitoring | [glances-dashboard.yml](infrastructure/monitoring/glances-dashboard.yml) |
| [![Syncthing](https://img.shields.io/badge/Syncthing-syncthing.net-0891D1?style=flat-square&logo=syncthing)](https://github.com/syncthing/syncthing) | Peer-to-peer file sync (config backup) | [syncthing.yml](services/management/syncthing/syncthing.yml) |
| [![SearXNG](https://img.shields.io/badge/SearXNG-github.com-3050FF?style=flat-square)](https://github.com/searxng/searxng) | Self-hosted metasearch engine | [searxng.yml](services/management/searxng/searxng.yml) |
| PostgreSQL (Ãƒ-8) | Relational database instances | Per-service |
| Redis (Ãƒ-3) | In-memory cache instances | Per-service |

### Development

| Service | Purpose | Location |
|---|---|---|
| [![DPlaneOS](https://img.shields.io/badge/DPlaneOS-webapp-blueviolet?style=flat-square)](https://github.com/4nonX/DPlaneOS) | Project landing page | [DPlaneOS-website.yml](services/development/DPlaneOS-website.yml) |
| Aptifolio | [Next.js](https://nextjs.org) frontend + [FastAPI](https://fastapi.tiangolo.com) backend + PDF resume parser | [aptifolio.yml](services/development/aptifolio.yml) |

---

## Storage strategy

> Full details: [infrastructure/storage/README.md](infrastructure/storage/README.md)

**33 TB across four HDDs** - currently BTRFS on mdadm RAID5 (legacy, from ZimaOS). Migrating to ZFS RAID-Z2 via [DPlaneOS](https://github.com/4nonX/DPlaneOS).

### Why ZFS

[ZFS](https://github.com/openzfs/zfs) RAID-Z2 (dual-parity) eliminates the write-hole vulnerability present in BTRFS RAID5, provides end-to-end checksumming at every level of the storage tree, and integrates cleanly with [DPlaneOS](https://github.com/4nonX/DPlaneOS)'s pool and dataset management. `zfs send` replication makes off-site backup straightforward. The 15+ year production track record in enterprise environments makes it the right choice for a long-lived NAS.

### Target pool layout

```
zpool: mainpool  (RAID-Z2, 4Ãƒ- HDD)
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ mainpool/appdata     /DATA/AppData Ã¢â‚¬â€ container bind-mount volumes
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ mainpool/media       /DATA/Media   Ã¢â‚¬â€ media library
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ mainpool/home        user home directories
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ mainpool/backups     local snapshot targets

zpool: bootpool  (mirror, NVMe)
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ NixOS system root
```

Pool and dataset configuration is managed through [DPlaneOS](https://github.com/4nonX/DPlaneOS). Refer to that repository for NixOS module definitions and dataset property details (`compression=zstd`, `xattr=sa`, `recordsize` tuning per workload).

---

## Repository structure

```
homelab/
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ infrastructure/
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ networking/
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ pihole/pihole.yml
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ traefik/          # Traefik config notes (VPS-managed)
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ pangolin/
Ã¢â€â€š   Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ README.md                    # Tunnel docs + component map
Ã¢â€â€š   Ã¢â€â€š       Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ terraform/                   # Infrastructure as Code
Ã¢â€â€š   Ã¢â€â€š           Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ main.tf / cloudflare.tf / vps.tf / backend.tf / variables.tf
Ã¢â€â€š   Ã¢â€â€š           Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ docker-compose.yml        # Pangolin stack (deployed to VPS)
Ã¢â€â€š   Ã¢â€â€š           Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ config/                   # Pangolin + Traefik configs
Ã¢â€â€š   Ã¢â€â€š           Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ scripts/backup.sh         # Weekly backup Ã¢â€ â€™ MinIO
Ã¢â€â€š   Ã¢â€â€š           Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ scripts/restore.sh        # DR restore from MinIO
Ã¢â€â€š   Ã¢â€â€š           Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ minio/docker-compose.yml  # MinIO on NAS (Dockge)
Ã¢â€â€š   Ã¢â€â€š           Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ pangolin-terraform-iac.md # IaC documentation
Ã¢â€â€š   Ã¢â€â€š           Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ DR_RUNBOOK.md             # Disaster recovery procedure
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ security/
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ vaultwarden/vaultwarden.yml
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ crowdsec/         # CrowdSec notes (VPS-managed)
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ monitoring/
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ big-bear-scrutiny/scrutiny.yml
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ big-bear-dockge/dockge.yml
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ big-bear-dockpeek/dockpeek.yml
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ glances-dashboard.yml
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ storage/
Ã¢â€â€š       Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ README.md
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ services/
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ media/
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ arr-suite.yml              # Sonarr, Radarr, Lidarr, Prowlarr, Bazarr, qBittorrent, Gluetun
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ audiobookshelf/audiobookshelf.yml
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ immich/immich.yml
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ navidrome/navidrome.yml
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ pinchflat/pinchflat.yml
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ stremio/stremio.yml
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ swingmusic/swingmusic.yml
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ productivity/
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ nextcloud.yml              # Nextcloud, Collabora, Talk HPB, Redis, PostgreSQL
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ big-bear-joplin/joplin.yml
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ big-bear-linkwarden/linkwarden.yml
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ big-bear-paperless-ngx/paperless.yml
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ big-bear-wallos/wallos.yml
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ memos/memos.yml
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ management/
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ stacks.yml
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ syncthing/syncthing.yml
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ searxng/searxng.yml
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ development/
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ DPlaneOS-website.yml
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ aptifolio.yml
    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ aptifolio-dockge.yml
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ scripts/
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ export-all-compose.sh
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ docs/
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ hardware-specs.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ homelab-complete-journey.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ docker-infrastructure.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ network-security.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ network-remote-access.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ media-stack.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ productivity-services.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ nextcloud-optimization-guide.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ homelab-dashboard-guide.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ pangolin-infrastructure.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ pangolin-deployment-guide.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ pangolin-configurations.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ pangolin-vps-relay-guide.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ pangolin-upgrade-guide.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ pangolin-z-performance-tuning.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ pangolin-traefikdashboard-guide.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ NIXOS-MIGRATION.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ DOCKER-SERVICES.md
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ INDEX.md
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ *.html               # Interactive architecture diagrams
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ docker/                  # Legacy source tree (see docker/README.md)
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ .env.example             # All required environment variables
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ README.md
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Operating system | [NixOS](https://nixos.org) Ã¢â‚¬â€ declarative, reproducible, atomic OTA |
| NAS management | [DPlaneOS](https://github.com/4nonX/DPlaneOS) *(self-developed)* Ã¢â‚¬â€ ZFS pool management, SMB/NFS, Docker orchestration, web UI |
| Container orchestration | [Docker Compose](https://docs.docker.com/compose/) |
| Reverse proxy | [Traefik](https://github.com/traefik/traefik) v3 Ã¢â‚¬â€ TLS 1.3, automatic Let's Encrypt |
| Tunnel | [Pangolin](https://github.com/fosrl/pangolin) Ã¢â‚¬â€ self-hosted Cloudflare Tunnel |
| Security | [CrowdSec](https://github.com/crowdsecurity/crowdsec) IDS/IPS |
| DNS | [Pi-hole](https://github.com/pi-hole/pi-hole) |
| Storage | [OpenZFS](https://github.com/openzfs/zfs) RAID-Z2 (target) - migrating from BTRFS on mdadm RAID5 - 33 TB |
| Databases | [PostgreSQL](https://www.postgresql.org) 14 (x8 instances), [Redis](https://redis.io) Alpine (x3 instances) |
| Hardware | Intel i3-13100 / 32 GB DDR4-3200 / 120 GB NVMe |
| VPS gateway | [IONOS](https://www.ionos.de) Berlin - 2 vCPU / 2 GB / 80 GB NVMe |

---

## Cost analysis

```
Initial investment
  Hardware            Ã¢â€šÂ¬1,290
  VPS (3 yr)            Ã¢â€šÂ¬180
  Domain (3 yr)          Ã¢â€šÂ¬36
  Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  Total               Ã¢â€šÂ¬1,506

Annual operating cost
  Electricity           Ã¢â€šÂ¬75    (~30 W average, Ã¢â€šÂ¬0.30/kWh)
  VPS                   Ã¢â€šÂ¬60
  Domain                Ã¢â€šÂ¬12
  Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  Total                Ã¢â€šÂ¬147/yr  (Ã¢â€šÂ¬12/month)

Replaced SaaS (annual)
  Google One            Ã¢â€šÂ¬30
  Dropbox Plus         Ã¢â€šÂ¬120
  1Password             Ã¢â€šÂ¬60
  Spotify              Ã¢â€šÂ¬180
  Netflix              Ã¢â€šÂ¬156
  iCloud+               Ã¢â€šÂ¬36
  Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  Total replaced       Ã¢â€šÂ¬582/yr

Net savings: Ã¢â€šÂ¬435/yr Ã¢â€ â€™ break-even Year 4
```

---

## Documentation

| Document | Description |
|---|---|
| [Why DPlaneOS](docs/why-dplaneos.md) | ZimaOS limitations, alternatives considered, what DPlaneOS solves |
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
| [NixOS Migration Plan](docs/NIXOS-MIGRATION.md) | ZimaOS Ã¢â€ â€™ NixOS migration roadmap |
| [Service Index](docs/DOCKER-SERVICES.md) | Full service inventory |

---

## Quick start

```bash
# Clone
git clone https://github.com/4nonX/homelab

# Set up environment variables
cp .env.example .env
$EDITOR .env   # fill in domains, passwords, IPs

# Deploy a stack Ã¢â‚¬â€ example: Nextcloud
cd services/productivity
docker compose -f nextcloud.yml up -d

# Deploy monitoring
cd infrastructure/monitoring
docker compose -f glances-dashboard.yml up -d
```

For the full external access setup ([Pangolin](https://github.com/fosrl/pangolin) tunnel + [Traefik](https://github.com/traefik/traefik) + [CrowdSec](https://github.com/crowdsecurity/crowdsec) on VPS), start with [docs/pangolin-deployment-guide.md](docs/pangolin-deployment-guide.md).

---

### Credit due
I've used a lot of open source projects to make this work. Here's a quick look at the main ones.

---

### Pangolin - the backbone of external access

> [![Pangolin](https://img.shields.io/badge/fosrl%2Fpangolin-self--hosted_tunnel-FF6B35?style=flat-square&logo=github)](https://github.com/fosrl/pangolin)

This handles just about everything for external access. [Pangolin](https://github.com/fosrl/pangolin) is a self-hosted
tunnelled reverse proxy with identity and access management - think [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/), but
open source and entirely under your control.

Before Pangolin, the realistic options for external access were: open ports on your home
router (bad), pay for a commercial tunnel (fine but a dependency), or set up [WireGuard](https://www.wireguard.com)
manually and manage it yourself (works, but significant operational overhead). Pangolin
wraps [WireGuard](https://www.wireguard.com), [Traefik](https://github.com/traefik/traefik), and an identity layer into something you can actually run on a
cheap VPS and forget about. Zero port-forwarding. Zero home IP exposure. [Let's Encrypt](https://letsencrypt.org)
certificates handled automatically. The security architecture of this entire homelab is
built around what Pangolin makes possible.

Components: [Pangolin](https://github.com/fosrl/pangolin) (control plane) Ã‚Â· [Gerbil](https://github.com/fosrl/gerbil) (WireGuard gateway) Ã‚Â· [Newt](https://github.com/fosrl/newt) (tunnel client) Ã‚Â· [Badger](https://github.com/fosrl/badger) (identity)

If you self-host anything that needs external access, start here.

---

### DPlaneOS - the NAS management layer (self-developed)

> [![DPlaneOS](https://img.shields.io/badge/4nonX%2FDPlaneOS-self--developed_NAS_OS-blueviolet?style=flat-square&logo=github)](https://github.com/4nonX/DPlaneOS)

The NAS management layer I built - [ZFS](https://github.com/openzfs/zfs) pool management, SMB/NFS shares, [Docker](https://www.docker.com)
orchestration, and a unified web UI, purpose-built on top of [NixOS](https://nixos.org).
Developed in Go to fill the gap between something like [CasaOS](https://github.com/IceWhaleTech/CasaOS) and [TrueNAS](https://www.truenas.com).

---

### Core infrastructure

| Project | Role in this stack |
|---|---|
| [![NixOS](https://img.shields.io/badge/NixOS-nixos.org-5277C3?style=flat-square&logo=nixos)](https://nixos.org) | The OS everything runs on. Declarative system configuration, atomic rollbacks, reproducible builds - the base that makes the whole stack manageable. [DPlaneOS](https://github.com/4nonX/DPlaneOS) runs on top of it. |
| [![Traefik](https://img.shields.io/badge/Traefik-traefik.io-24A1C1?style=flat-square&logo=traefikproxy)](https://github.com/traefik/traefik) | Reverse proxy - TLS termination, automatic [Let's Encrypt](https://letsencrypt.org), routing. Runs on the VPS and handles inbound HTTPS requests. |
| [![CrowdSec](https://img.shields.io/badge/CrowdSec-crowdsec.net-1565C0?style=flat-square)](https://github.com/crowdsecurity/crowdsec) | Collaborative IDS/IPS. Analyses [Traefik](https://github.com/traefik/traefik) logs, bans malicious IPs via bouncer, pulls community threat feeds. Passive security layer that more or less works out of the box. |
| [![Pi-hole](https://img.shields.io/badge/Pi--hole-pi--hole.net-CC0000?style=flat-square)](https://github.com/pi-hole/pi-hole) | Network-wide DNS and ad-blocking. |
| [![OpenZFS](https://img.shields.io/badge/OpenZFS-openzfs.org-2A7AE2?style=flat-square)](https://github.com/openzfs/zfs) | The filesystem everything is migrating to. End-to-end checksumming, RAID-Z2, snapshots, `zfs send` replication. |

---

### Services

| Project | What it replaces |
|---|---|
| [![Nextcloud](https://img.shields.io/badge/Nextcloud-nextcloud.com-0082C9?style=flat-square&logo=nextcloud)](https://github.com/nextcloud/server) | Google Drive, Google Docs, iCloud |
| [![Immich](https://img.shields.io/badge/Immich-immich.app-4250AF?style=flat-square)](https://github.com/immich-app/immich) | Google Photos |
| [![Vaultwarden](https://img.shields.io/badge/Vaultwarden-github.com-175DDC?style=flat-square&logo=bitwarden)](https://github.com/dani-garcia/vaultwarden) | 1Password, LastPass |
| [![Paperless-ngx](https://img.shields.io/badge/Paperless--ngx-github.com-51CF66?style=flat-square)](https://github.com/paperless-ngx/paperless-ngx) | Manual document filing |
| [![Emby](https://img.shields.io/badge/Emby-emby.media-52B54B?style=flat-square)](https://emby.media) | Netflix, Plex (self-hosted media server) |
| [![Sonarr](https://img.shields.io/badge/Sonarr-sonarr.tv-35C5F4?style=flat-square)](https://github.com/Sonarr/Sonarr) [![Radarr](https://img.shields.io/badge/Radarr-radarr.video-FFC230?style=flat-square)](https://github.com/Radarr/Radarr) [![Lidarr](https://img.shields.io/badge/Lidarr-lidarr.audio-1DA0C2?style=flat-square)](https://github.com/Lidarr/Lidarr) | Manual media management |
| [![Prowlarr](https://img.shields.io/badge/Prowlarr-github.com-FF6600?style=flat-square)](https://github.com/Prowlarr/Prowlarr) | Per-client indexer configuration |
| [![Bazarr](https://img.shields.io/badge/Bazarr-bazarr.media-F5A623?style=flat-square)](https://github.com/morpheus65535/bazarr) | Manual subtitle hunting |
| [![Gluetun](https://img.shields.io/badge/Gluetun-github.com-3A3A3A?style=flat-square)](https://github.com/qdm12/gluetun) | Any VPN client: containerised, provider-agnostic [WireGuard](https://www.wireguard.com) gateway |
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

[![DPlaneOS](https://img.shields.io/badge/DPlaneOS-open_source_NAS_OS-blueviolet?style=flat-square&logo=github)](https://github.com/4nonX/DPlaneOS)
[![Pangolin](https://img.shields.io/badge/Pangolin-self--hosted_tunnel-orange?style=flat-square&logo=github)](https://github.com/fosrl/pangolin)


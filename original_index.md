# Index

Complete map of every file in this repository.

---

## Top level

| File | Description |
|---|---|
| [README.md](README.md) | Architecture overview, service matrix, storage strategy, quick start |
| [.env.example](.env.example) | Template for all required environment variables |

---

## Documentation ÔÇö `docs/`

### Platform & decisions

| File | Description |
|---|---|
| [docs/why-DPlaneOS.md](docs/why-DPlaneOS.md) | Why ZimaOS was replaced ÔÇö limitations, alternatives considered, what DPlaneOS solves |
| [docs/NIXOS-MIGRATION.md](docs/NIXOS-MIGRATION.md) | Full migration plan: ZimaOS ÔåÆ NixOS + DPlaneOS, phased approach, risk assessment |
| [docs/homelab-complete-journey.md](docs/homelab-complete-journey.md) | Full build narrative ÔÇö hardware, OS selection, storage, networking, lessons learned |

### Hardware & infrastructure

| File | Description |
|---|---|
| [docs/hardware-specs.md](docs/hardware-specs.md) | Component list, CPU/RAM/storage specs, performance benchmarks, power draw |
| [docs/docker-infrastructure.md](docs/docker-infrastructure.md) | Container architecture, Docker Compose strategy, network design, resource management |

### Storage

| File | Description |
|---|---|
| [infrastructure/storage/README.md](infrastructure/storage/README.md) | Storage architecture ÔÇö ZFS RAID-Z2 target, BTRFS migration, dataset layout, why ZFS |

### Networking & external access

| File | Description |
|---|---|
| [docs/network-security.md](docs/network-security.md) | Network topology, security layers, firewall configuration |
| [docs/network-remote-access.md](docs/network-remote-access.md) | Remote access strategy ÔÇö Pangolin vs Tailscale vs ZeroTier, VPN architecture |
| [docs/pangolin-infrastructure.md](docs/pangolin-infrastructure.md) | Pangolin architecture deep-dive ÔÇö components, security model, cost analysis |
| [docs/pangolin-deployment-guide.md](docs/pangolin-deployment-guide.md) | Step-by-step VPS setup ÔÇö DNS, server deployment, client installation, hardening |
| [docs/pangolin-configurations.md](docs/pangolin-configurations.md) | Sanitised config reference ÔÇö Docker Compose, server config, client setup |
| [docs/pangolin-vps-relay-guide.md](docs/pangolin-vps-relay-guide.md) | Raspberry Pi as Pangolin brain ÔÇö static IP, installation, VPS relay, live cutover |
| [docs/pangolin-traefikdashboard-guide.md](docs/pangolin-traefikdashboard-guide.md) | Traefik dashboard setup behind Pangolin |
| [docs/pangolin-upgrade-guide.md](docs/pangolin-upgrade-guide.md) | Version upgrade procedures, rollback, v1.12.2 ÔåÆ v1.14.1 migration |
| [docs/pangolin-z-performance-tuning.md](docs/pangolin-z-performance-tuning.md) | Latency tuning ÔÇö WireGuard MTU, keepalive, Traefik timeouts, sysctl |

### Services

| File | Description |
|---|---|
| [docs/media-stack.md](docs/media-stack.md) | Arr suite integration, VPN-gated downloads, quality profiles |
| [docs/productivity-services.md](docs/productivity-services.md) | Nextcloud, Immich, Paperless-NGX, Vaultwarden setup notes |
| [docs/nextcloud-optimization-guide.md](docs/nextcloud-optimization-guide.md) | Nextcloud performance ÔÇö PostgreSQL tuning, Redis, Collabora, Talk HPB, troubleshooting |
| [docs/homelab-dashboard-guide.md](docs/homelab-dashboard-guide.md) | Homelab dashboard setup and usage |
| [docs/DOCKER-SERVICES.md](docs/DOCKER-SERVICES.md) | Full service inventory |

### Diagrams

| File | Description |
|---|---|
| [docs/architecture-diagram.html](docs/architecture-diagram.html) | Interactive system architecture diagram |
| [docs/dataflow-diagram.html](docs/dataflow-diagram.html) | Service data flow diagram |
| [docs/security-diagram.html](docs/security-diagram.html) | Security layers diagram |

---

## Infrastructure ÔÇö `infrastructure/`

### Networking

| File | Description |
|---|---|
| [infrastructure/networking/pihole/pihole.yml](infrastructure/networking/pihole/pihole.yml) | Pi-hole ÔÇö DNS + network-wide ad-blocking |
| [infrastructure/networking/pangolin/README.md](infrastructure/networking/pangolin/README.md) | Pangolin component map, traffic flow, links to all Pangolin docs |
| [infrastructure/networking/traefik/README.md](infrastructure/networking/traefik/README.md) | Traefik config notes (VPS-managed) |

| **[Terraform IaC](infrastructure/networking/pangolin/terraform/pangolin-terraform-iac.md)** | Terraform setup, backup strategy, DR key decisions | new |

### Security

| File | Description |
|---|---|
| [infrastructure/security/vaultwarden/vaultwarden.yml](infrastructure/security/vaultwarden/vaultwarden.yml) | Vaultwarden ÔÇö self-hosted Bitwarden server |
| [infrastructure/security/crowdsec/README.md](infrastructure/security/crowdsec/README.md) | CrowdSec notes ÔÇö IDS/IPS integration with Traefik (VPS-managed) |

### Monitoring

| File | Description |
|---|---|
| [infrastructure/monitoring/glances-dashboard.yml](infrastructure/monitoring/glances-dashboard.yml) | Glances system monitor + nginx homelab dashboard |
| [infrastructure/monitoring/big-bear-scrutiny/scrutiny.yml](infrastructure/monitoring/big-bear-scrutiny/scrutiny.yml) | Scrutiny ÔÇö S.M.A.R.T disk health monitoring |
| [infrastructure/monitoring/big-bear-dockge/dockge.yml](infrastructure/monitoring/big-bear-dockge/dockge.yml) | Dockge ÔÇö Docker Compose management UI |
| [infrastructure/monitoring/big-bear-dockpeek/dockpeek.yml](infrastructure/monitoring/big-bear-dockpeek/dockpeek.yml) | Dockpeek ÔÇö container health dashboard |

### Storage

| File | Description |
|---|---|
| [infrastructure/storage/README.md](infrastructure/storage/README.md) | ZFS RAID-Z2 target, BTRFS legacy state, migration plan, dataset layout |

---

## Services ÔÇö `services/`

### Media

| File | Description |
|---|---|
| [services/media/arr-suite.yml](services/media/arr-suite.yml) | Sonarr, Radarr, Lidarr, Prowlarr, Bazarr, qBittorrent, Gluetun VPN |
| [services/media/immich/immich.yml](services/media/immich/immich.yml) | Immich ÔÇö Google Photos replacement |
| [services/media/audiobookshelf/audiobookshelf.yml](services/media/audiobookshelf/audiobookshelf.yml) | Audiobookshelf ÔÇö audiobooks + podcasts |
| [services/media/navidrome/navidrome.yml](services/media/navidrome/navidrome.yml) | Navidrome ÔÇö music streaming (Subsonic API) |
| [services/media/swingmusic/swingmusic.yml](services/media/swingmusic/swingmusic.yml) | SwingMusic ÔÇö self-hosted music player |
| [services/media/pinchflat/pinchflat.yml](services/media/pinchflat/pinchflat.yml) | Pinchflat ÔÇö YouTube archiver |
| [services/media/stremio/stremio.yml](services/media/stremio/stremio.yml) | Stremio ÔÇö streaming add-on server |

### Productivity

| File | Description |
|---|---|
| [services/productivity/nextcloud.yml](services/productivity/nextcloud.yml) | Nextcloud, Collabora Online, Talk HPB, Redis, PostgreSQL |
| [services/productivity/big-bear-paperless-ngx/paperless.yml](services/productivity/big-bear-paperless-ngx/paperless.yml) | Paperless-NGX ÔÇö document OCR and archive |
| [services/productivity/big-bear-joplin/joplin.yml](services/productivity/big-bear-joplin/joplin.yml) | Joplin Server ÔÇö note sync backend |
| [services/productivity/memos/memos.yml](services/productivity/memos/memos.yml) | Memos ÔÇö lightweight notes and journal |
| [services/productivity/big-bear-linkwarden/linkwarden.yml](services/productivity/big-bear-linkwarden/linkwarden.yml) | Linkwarden ÔÇö bookmark archiver with full-page capture |
| [services/productivity/big-bear-wallos/wallos.yml](services/productivity/big-bear-wallos/wallos.yml) | Wallos ÔÇö subscription and expense tracker |

### Management

| File | Description |
|---|---|
| [services/management/syncthing/syncthing.yml](services/management/syncthing/syncthing.yml) | Syncthing ÔÇö peer-to-peer file sync |
| [services/management/searxng/searxng.yml](services/management/searxng/searxng.yml) | SearXNG ÔÇö self-hosted metasearch engine |
| [services/management/stacks.yml](services/management/stacks.yml) | Stacks ÔÇö compose stack management |

### Development

| File | Description |
|---|---|
| [services/development/DPlaneOS-website.yml](services/development/DPlaneOS-website.yml) | DPlaneOS project website |
| [services/development/aptifolio.yml](services/development/aptifolio.yml) | Aptifolio ÔÇö Next.js frontend + FastAPI backend + PDF resume parser |
| [services/development/aptifolio-dockge.yml](services/development/aptifolio-dockge.yml) | Aptifolio ÔÇö alternate Dockge-managed compose |

---

## Scripts ÔÇö `scripts/`

| File | Description |
|---|---|
| [scripts/export-all-compose.sh](scripts/export-all-compose.sh) | Export all Docker Compose stacks from the running system |

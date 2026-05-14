# Index

Complete map of every file in this repository.

---

## Top level

| File | Description |
|---|---|
| [README.md](README.md) | Architecture overview, service matrix, storage strategy, quick start |
| [.env.example](.env.example) | Template for all required environment variables |

---

## Documentation - `docs/`

### Platform & decisions

| File | Description |
|---|---|
| [docs/EXECUTIVE_SUMMARY.md](docs/EXECUTIVE_SUMMARY.md) | At-a-glance overview - key achievements, business value, quick stats |
| [docs/PORTFOLIO.md](docs/PORTFOLIO.md) | Portfolio showcase - skills demonstration, technical implementation, GitHub-optimised presentation |
| [docs/why-dplaneos.md](docs/why-dplaneos.md) | Why ZimaOS was replaced - limitations, alternatives considered, what DPlaneOS solves |
| [docs/NIXOS-MIGRATION.md](docs/NIXOS-MIGRATION.md) | Full migration plan: ZimaOS → NixOS + DPlaneOS, phased approach, risk assessment |
| [docs/homelab-complete-journey.md](docs/homelab-complete-journey.md) | Full build narrative - hardware, OS selection, storage, networking, lessons learned |

### Hardware & infrastructure

| File | Description |
|---|---|
| [docs/hardware-specs.md](docs/hardware-specs.md) | Component list, CPU/RAM/storage specs, performance benchmarks, power draw |
| [docs/docker-infrastructure.md](docs/docker-infrastructure.md) | Container architecture, Docker Compose strategy, network design, resource management |

### Storage

| File | Description |
|---|---|
| [infrastructure/storage/README.md](infrastructure/storage/README.md) | Storage architecture - ZFS RAID-Z2 target, BTRFS migration, dataset layout, why ZFS |

### Networking & external access

| File | Description |
|---|---|
| [docs/network-security.md](docs/network-security.md) | Network topology, security layers, firewall configuration |
| [docs/network-remote-access.md](docs/network-remote-access.md) | Remote access strategy - Pangolin vs Tailscale vs ZeroTier, VPN architecture |
| [docs/pangolin-infrastructure.md](docs/pangolin-infrastructure.md) | Pangolin architecture deep-dive - components, security model, cost analysis |
| [docs/pangolin-deployment-guide.md](docs/pangolin-deployment-guide.md) | Step-by-step VPS setup - DNS, server deployment, client installation, hardening |
| [docs/pangolin-configurations.md](docs/pangolin-configurations.md) | Sanitised config reference - Docker Compose, server config, client setup |
| [docs/pangolin-vps-relay-guide.md](docs/pangolin-vps-relay-guide.md) | Raspberry Pi as Pangolin brain - static IP, installation, VPS relay, live cutover |
| [docs/pangolin-traefikdashboard-guide.md](docs/pangolin-traefikdashboard-guide.md) | Traefik dashboard setup behind Pangolin |
| [docs/pangolin-upgrade-guide.md](docs/pangolin-upgrade-guide.md) | Version upgrade procedures, rollback, v1.12.2 → v1.14.1 migration |
| [docs/pangolin-z-performance-tuning.md](docs/pangolin-z-performance-tuning.md) | Latency tuning - WireGuard MTU, keepalive, Traefik timeouts, sysctl |
| [docs/pangolin-ha-setup.md](docs/pangolin-ha-setup.md) | Active-passive HA failover - Litestream B2 replication, Cloudflare DNS flip, ~7-8 min RTO |

### Services

| File | Description |
|---|---|
| [docs/media-stack.md](docs/media-stack.md) | Arr suite integration, VPN-gated downloads, quality profiles |
| [docs/productivity-services.md](docs/productivity-services.md) | Nextcloud, Immich, Paperless-NGX, Vaultwarden setup notes |
| [docs/nextcloud-optimization-guide.md](docs/nextcloud-optimization-guide.md) | Nextcloud performance - PostgreSQL tuning, Redis, Collabora, Talk HPB, troubleshooting |
| [docs/nextcloud-update-guide.md](docs/nextcloud-update-guide.md) | Nextcloud update procedure - ordered occ commands, failure diagnosis, 502 behind Traefik |
| [docs/homelab-dashboard-guide.md](docs/homelab-dashboard-guide.md) | Homelab dashboard setup and usage |
| [docs/DOCKER-SERVICES.md](docs/DOCKER-SERVICES.md) | Full service inventory |

### Diagrams

| File | Description |
|---|---|
| [docs/architecture-diagram.html](docs/architecture-diagram.html) | Interactive system architecture diagram |
| [docs/dataflow-diagram.html](docs/dataflow-diagram.html) | Service data flow diagram |
| [docs/security-diagram.html](docs/security-diagram.html) | Security layers diagram |

---

## Infrastructure - `infrastructure/`

### Networking

| File | Description |
|---|---|
| [infrastructure/networking/pihole/pihole.yml](infrastructure/networking/pihole/pihole.yml) | Pi-hole - DNS + network-wide ad-blocking |
| [infrastructure/networking/newt/newt.yml](infrastructure/networking/newt/newt.yml) | Newt - Pangolin tunnel client (WireGuard-based reverse proxy) |
| [infrastructure/networking/tailscale-derper/tailscale-derper.yml](infrastructure/networking/tailscale-derper/tailscale-derper.yml) | Tailscale DERP relay server |
| [infrastructure/networking/pangolin/README.md](infrastructure/networking/pangolin/README.md) | Pangolin component map, traffic flow, links to all Pangolin docs |
| [infrastructure/networking/traefik/README.md](infrastructure/networking/traefik/README.md) | Traefik config notes (VPS-managed) |
| [infrastructure/networking/pangolin/terraform/pangolin-terraform-iac.md](infrastructure/networking/pangolin/terraform/pangolin-terraform-iac.md) | Terraform IaC - DNS, VPS provisioning, backup strategy, DR key decisions |
| [infrastructure/networking/pangolin/terraform/DR_RUNBOOK.md](infrastructure/networking/pangolin/terraform/DR_RUNBOOK.md) | Disaster recovery runbook - full VPS rebuild in ~15 min |

### Security

| File | Description |
|---|---|
| [infrastructure/security/vaultwarden/vaultwarden.yml](infrastructure/security/vaultwarden/vaultwarden.yml) | Vaultwarden - self-hosted Bitwarden server |
| [infrastructure/security/crowdsec/README.md](infrastructure/security/crowdsec/README.md) | CrowdSec notes - IDS/IPS integration with Traefik (VPS-managed) |

### Monitoring

| File | Description |
|---|---|
| [infrastructure/monitoring/glances-dashboard.yml](infrastructure/monitoring/glances-dashboard.yml) | Glances system monitor + nginx homelab dashboard |
| [infrastructure/monitoring/beszel/beszel.yml](infrastructure/monitoring/beszel/beszel.yml) | Beszel - lightweight server resource monitoring hub |
| [infrastructure/monitoring/beszel-agent/beszel-agent.yml](infrastructure/monitoring/beszel-agent/beszel-agent.yml) | Beszel agent - per-host metrics collector |
| [infrastructure/monitoring/big-bear-scrutiny/scrutiny.yml](infrastructure/monitoring/big-bear-scrutiny/scrutiny.yml) | Scrutiny - S.M.A.R.T disk health monitoring |
| [infrastructure/monitoring/big-bear-dockge/dockge.yml](infrastructure/monitoring/big-bear-dockge/dockge.yml) | Dockge - Docker Compose stack management UI |
| [infrastructure/monitoring/big-bear-dockpeek/dockpeek.yml](infrastructure/monitoring/big-bear-dockpeek/dockpeek.yml) | Dockpeek - container health dashboard |

### Storage

| File | Description |
|---|---|
| [infrastructure/storage/minio/minio.yml](infrastructure/storage/minio/minio.yml) | MinIO - S3-compatible local object storage |
| [infrastructure/storage/README.md](infrastructure/storage/README.md) | ZFS RAID-Z2 target, BTRFS legacy state, migration plan, dataset layout |

---

## Services - `services/`

### Media

| File | Description |
|---|---|
| [services/media/arr-suite.yml](services/media/arr-suite.yml) | Emby, Sonarr, Radarr, Lidarr, Prowlarr, Bazarr, qBittorrent, Gluetun VPN, Seerr, Maintainerr |
| [services/media/books/books.yml](services/media/books/books.yml) | Books stack: Audiobookshelf, Grimmory, Bookkeep, Readmeabook |
| [services/media/immich/immich.yml](services/media/immich/immich.yml) | Immich - Google Photos replacement |
| [services/media/navidrome/navidrome.yml](services/media/navidrome/navidrome.yml) | Navidrome - music streaming (Subsonic API) |
| [services/media/swingmusic/swingmusic.yml](services/media/swingmusic/swingmusic.yml) | SwingMusic - self-hosted music player |
| [services/media/pinchflat/pinchflat.yml](services/media/pinchflat/pinchflat.yml) | Pinchflat - YouTube archiver |
| [services/media/stremio/stremio.yml](services/media/stremio/stremio.yml) | Stremio - streaming add-on server |

### Productivity

| File | Description |
|---|---|
| [services/productivity/nextcloud.yml](services/productivity/nextcloud.yml) | Nextcloud, Collabora Online, Talk HPB, Redis, PostgreSQL |
| [services/productivity/bentopdf/bentopdf.yml](services/productivity/bentopdf/bentopdf.yml) | BentoPDF - PDF tools web app |
| [services/productivity/cryptpad/cryptpad.yml](services/productivity/cryptpad/cryptpad.yml) | CryptPad - end-to-end encrypted collaborative office suite |
| [services/productivity/glass-keep/glass-keep.yml](services/productivity/glass-keep/glass-keep.yml) | Glass Keep - lightweight notes app |
| [services/productivity/librum/librum.yml](services/productivity/librum/librum.yml) | Librum - self-hosted ebook reading and library server |
| [services/productivity/revolt/revolt.yml](services/productivity/revolt/revolt.yml) | Revolt.chat - self-hosted Discord alternative |
| [services/productivity/trilium/trilium.yml](services/productivity/trilium/trilium.yml) | TriliumNext Notes - hierarchical knowledge base |
| [services/productivity/big-bear-paperless-ngx/paperless.yml](services/productivity/big-bear-paperless-ngx/paperless.yml) | Paperless-NGX - document OCR and archive |
| [services/productivity/big-bear-joplin/joplin.yml](services/productivity/big-bear-joplin/joplin.yml) | Joplin Server - note sync backend |
| [services/productivity/memos/memos.yml](services/productivity/memos/memos.yml) | Memos - lightweight notes and journal |
| [services/productivity/big-bear-linkwarden/linkwarden.yml](services/productivity/big-bear-linkwarden/linkwarden.yml) | Linkwarden - bookmark archiver with full-page capture |
| [services/productivity/big-bear-wallos/wallos.yml](services/productivity/big-bear-wallos/wallos.yml) | Wallos - subscription and expense tracker |

### Management

| File | Description |
|---|---|
| [services/management/homarr/homarr.yml](services/management/homarr/homarr.yml) | Homarr - service dashboard |
| [services/management/kasm/kasm.yml](services/management/kasm/kasm.yml) | Kasm - containerized browser/desktop streaming |
| [services/management/heaper/heaper.yml](services/management/heaper/heaper.yml) | Heaper - Docker host resource and container manager |
| [services/management/arcane/arcane.yml](services/management/arcane/arcane.yml) | Arcane - Docker management UI |
| [services/management/syncthing/syncthing.yml](services/management/syncthing/syncthing.yml) | Syncthing - peer-to-peer file sync |
| [services/management/searxng/searxng.yml](services/management/searxng/searxng.yml) | SearXNG - self-hosted metasearch engine |
| [services/management/stacks.yml](services/management/stacks.yml) | Zelest Stacks - compose stack management UI |

### Development

| File | Description |
|---|---|
| [services/development/d-planeos-website.yml](services/development/d-planeos-website.yml) | DPlaneOS marketing website (nginx static) |
| [services/development/dan-portfolio/dan-portfolio.yml](services/development/dan-portfolio/dan-portfolio.yml) | Personal portfolio site (PHP + Postfix relay) |
| [services/development/forgejo/forgejo.yml](services/development/forgejo/forgejo.yml) | Forgejo - self-hosted Git forge |
| [services/development/nginx-cv/nginx-cv.yml](services/development/nginx-cv/nginx-cv.yml) | Nginx CV page |
| [services/development/resume-builder.yml](services/development/resume-builder.yml) | Resume Builder - Next.js frontend + FastAPI backend + AI-powered PDF resume parser |

---

## Scripts - `scripts/`

| File | Description |
|---|---|
| [scripts/export-all-compose.sh](scripts/export-all-compose.sh) | Export all Docker Compose stacks from the running system |



# Docker Services - Complete Inventory

This document provides a complete inventory of all containerized services with links to their compose files.

**Last Updated:** February 17, 2026  
**Total Services:** 60+ containers  
**Total Compose Files:** 24  

---

## Repository Structure
```
docker/
â”œâ”€â”€ media-management/     # Arr stack + downloaders
â”œâ”€â”€ media-servers/        # Emby, Immich, music
â”œâ”€â”€ productivity/         # Nextcloud, Paperless-ngx
â”œâ”€â”€ development/          # Portfolio projects
â”œâ”€â”€ security/            # Vaultwarden, Pi-hole
â”œâ”€â”€ monitoring/          # Scrutiny, health checks
â””â”€â”€ infrastructure/      # Core services
```

---

## Media Management

### Arr Stack
**Location:** `docker/media-management/emby-arr/`

Complete media automation stack running behind Gluetun VPN:
- Sonarr [![Sonarr](https://img.shields.io/badge/Sonarr-sonarr.tv-35C5F4?style=flat-square)](https://github.com/Sonarr/Sonarr)
- Radarr [![Radarr](https://img.shields.io/badge/Radarr-radarr.video-FFC230?style=flat-square)](https://github.com/Radarr/Radarr)
- Lidarr [![Lidarr](https://img.shields.io/badge/Lidarr-lidarr.audio-1DA0C2?style=flat-square)](https://github.com/Lidarr/Lidarr)
- Bazarr [![Bazarr](https://img.shields.io/badge/Bazarr-bazarr.media-F5A623?style=flat-square)](https://github.com/morpheus65535/bazarr)
- Prowlarr [![Prowlarr](https://img.shields.io/badge/Prowlarr-github.com-FF6600?style=flat-square)](https://github.com/Prowlarr/Prowlarr)
- Recyclarr [![Recyclarr](https://img.shields.io/badge/Recyclarr-github.com-3A3A3A?style=flat-square)](https://github.com/recyclarr/recyclarr)
- Maintainerr [![Maintainerr](https://img.shields.io/badge/Maintainerr-github.com-5E4FCD?style=flat-square)](https://github.com/jorenn92/Maintainerr)
- FlareSolverr [![FlareSolverr](https://img.shields.io/badge/FlareSolverr-github.com-00BFFF?style=flat-square)](https://github.com/FlareSolverr/FlareSolverr)
- qBittorrent [![qBittorrent](https://img.shields.io/badge/qBittorrent-qbittorrent.org-2F67BA?style=flat-square)](https://github.com/qbittorrent/qBittorrent)
- Gluetun [![Gluetun](https://img.shields.io/badge/Gluetun-github.com-3A3A3A?style=flat-square)](https://github.com/qdm12/gluetun)
- Seerr [![Seerr](https://img.shields.io/badge/Seerr-github.com-E50914?style=flat-square)](https://github.com/sct/overseerr)
- Homarr [![Homarr](https://img.shields.io/badge/Homarr-homarr.dev-E5004F?style=flat-square)](https://github.com/ajnart/homarr)

**Files:**
- `compose.yaml` - Complete stack definition

---

## Media Servers

### Immich
**Location:** `docker/media-servers/immich/`

AI-powered photo management with machine learning:
- Server, PostgreSQL, Redis, ML worker [![Immich](https://img.shields.io/badge/Immich-immich.app-4250AF?style=flat-square)](https://github.com/immich-app/immich)

**Files:**
- `docker-compose.yml`

### Emby
**Location:** `docker/media-servers/emby/`

Main media server for movies, TV shows, music. [![Emby](https://img.shields.io/badge/Emby-emby.media-52B54B?style=flat-square)](https://emby.media)

**Files:**
- `docker-compose.yml`

### Music Services

**Audiobookshelf:** `docker/media-servers/audiobookshelf/` [![Audiobookshelf](https://img.shields.io/badge/Audiobookshelf-audiobookshelf.org-E76F51?style=flat-square)](https://github.com/advplyr/audiobookshelf)  
**Navidrome:** `docker/media-servers/navidrome/` [![Navidrome](https://img.shields.io/badge/Navidrome-navidrome.org-FF7700?style=flat-square)](https://github.com/navidrome/navidrome)  
**SwingMusic:** `docker/media-servers/swingmusic/` [![SwingMusic](https://img.shields.io/badge/SwingMusic-github.com-7C3AED?style=flat-square)](https://github.com/swingmx/swingmusic)  

### Other Media

**Pinchflat:** `docker/media-servers/pinchflat/` [![Pinchflat](https://img.shields.io/badge/Pinchflat-github.com-FF0000?style=flat-square)](https://github.com/kieraneglin/pinchflat) - YouTube archival  
**Stremio:** `docker/media-servers/stremio/` [![Stremio](https://img.shields.io/badge/Stremio-stremio.com-6B46C1?style=flat-square)](https://github.com/Stremio/server-docker) - Streaming aggregator  

---

## Productivity

### Nextcloud
**Location:** `docker/productivity/nextcloud/`

Complete cloud suite with:
- Nextcloud server [![Nextcloud](https://img.shields.io/badge/Nextcloud-nextcloud.com-0082C9?style=flat-square&logo=nextcloud)](https://github.com/nextcloud/server)
- Collabora Online [![Collabora-Online](https://img.shields.io/badge/Collabora--Online-collaboraonline.com-4FAD4F?style=flat-square)](https://github.com/CollaboraOnline/online)
- Talk signaling server
- PostgreSQL database
- Redis cache
- NATS messaging

**Files:**
- `compose.yaml`

### Document Management

**Paperless-ngx:** `docker/productivity/big-bear-paperless-ngx/` [![Paperless-ngx](https://img.shields.io/badge/Paperless--ngx-github.com-51CF6Green?style=flat-square)](https://github.com/paperless-ngx/paperless-ngx)
- Document OCR and management
- PostgreSQL, Redis, Tika, Gotenberg

**Joplin:** `docker/productivity/big-bear-joplin/` [![Joplin](https://img.shields.io/badge/Joplin-joplinapp.org-1071D3?style=flat-square)](https://github.com/laurent22/joplin)
- Note-taking server with PostgreSQL

**Linkwarden:** `docker/productivity/big-bear-linkwarden/` [![Linkwarden](https://img.shields.io/badge/Linkwarden-linkwarden.app-6B46C1?style=flat-square)](https://github.com/linkwarden/linkwarden)
- Bookmark manager with PostgreSQL

**Memos:** `docker/productivity/memos/` [![Memos](https://img.shields.io/badge/Memos-usememos.com-FFCB47?style=flat-square)](https://github.com/usememos/memos)
- Quick notes

**Wallos:** `docker/productivity/big-bear-wallos/` [![Wallos](https://img.shields.io/badge/Wallos-github.com-4CAF50?style=flat-square)](https://github.com/ellite/Wallos)
- Subscription tracker

---

## Development

### Portfolio Builder
**Location:** `docker/development/portfolio-builder/`

Full-stack portfolio application:
- React frontend
- Django backend
- PostgreSQL database
- Caddy web server

**Files:**
- `compose.yaml`
- `docker-compose.yml`
- `docker-compose.dockge.yml`

### Personal Projects

**Dan Portfolio:** `docker/development/dan-portfolio/` - PHP portfolio site  
**DPlaneOS Website:** `docker/development/dplaneos-website2/` [![DPlaneOS](https://img.shields.io/badge/DPlaneOS-open_source_NAS_OS-blueviolet?style=flat-square&logo=github)](https://github.com/4nonX/DPlaneOS)  
**nginx-cv-final:** `docker/development/nginx-cv-final/` - CV website  

---

## Security

### Vaultwarden
**Location:** `docker/security/vaultwarden/` [![Vaultwarden](https://img.shields.io/badge/Vaultwarden-github.com-175DDC?style=flat-square&logo=bitwarden)](https://github.com/dani-garcia/vaultwarden)

Self-hosted Bitwarden password manager.

**Files:**
- `docker-compose.yml`

### Pi-hole
**Location:** `docker/security/pihole/` [![Pi-hole](https://img.shields.io/badge/Pi--hole-pi--hole.net-CC0000?style=flat-square)](https://github.com/pi-hole/pi-hole)

Network-wide ad blocking and DNS server.

**Files:**
- `docker-compose.yml`

---

## Monitoring

### Homelab Dashboard
**Location:** `docker/monitoring/homelab-dashboard/`

Custom dashboard with:
- Nginx web server
- PHP-FPM
- System stats display

**Files:**
- `compose.yaml`

### System Monitoring

**Scrutiny:** `docker/monitoring/big-bear-scrutiny/` [![Scrutiny](https://img.shields.io/badge/Scrutiny-github.com-E53935?style=flat-square)](https://github.com/AnalogJ/scrutiny)
- Hard drive health monitoring (S.M.A.R.T)
- InfluxDB for metrics storage

**DockPeek:** `docker/monitoring/big-bear-dockpeek/` [![DockPeek](https://img.shields.io/badge/DockPeek-github.com-51CF66?style=flat-square)](https://github.com/louislam/dockge)
- Container inspection tool

---

## Infrastructure

### Core Services

**Newt:** `docker/infrastructure/newt/`
- Pangolin tunnel relay

**nginx:** `docker/infrastructure/nginx/`
- Various web services

**Zelest:** `docker/infrastructure/zelest/`
- Internal service

**SearXNG:** `docker/infrastructure/searxng/`
- Privacy-respecting search engine

**Syncthing:** `docker/infrastructure/syncthing/` [![Syncthing](https://img.shields.io/badge/Syncthing-syncthing.net-0891D1?style=flat-square&logo=syncthing)](https://github.com/syncthing/syncthing)
- File synchronization across devices

---

## Statistics
```
Media Management:     1 stack (12 containers)
Media Servers:        6 services
Productivity:         6 services (15 containers)
Development:          4 projects
Security:             2 services
Monitoring:           4 services
Infrastructure:       5 services
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Total:                24 compose files, 60+ containers
```

---

## Deployment

### Deploy a Service
```bash
cd docker/<category>/<service>
docker compose up -d
```

### View Logs
```bash
docker compose logs -f
```

### Update Service
```bash
docker compose pull
docker compose up -d
```

### Stop Service
```bash
docker compose down
```

---

Services are synced via DPlaneOS's GitOps engine:

1. **Add Repository:** `https://github.com/4nonX/homelab`
2. **Configure Sync:**
   - Branch: `main`
   - Path: `docker/<category>/<service>/compose.yaml`
   - Auto-sync: Enabled
   - Interval: 5 minutes

3. **Deploy:** Changes pushed to GitHub auto-deploy

---

## Notes

### Environment Variables

All sensitive values (passwords, API keys) are stored in `.env` files that are **gitignored**. Each service should have:

- `.env` (local, not committed)
- `.env.example` (template, committed)

### Data Persistence

Data directories are stored in:
- `/DATA/AppData/<service>/` on ZimaOS
- Mapped to `/app/data` or similar in containers

### Network Configuration

Most services use Docker bridge networks for isolation. Services that need to communicate are on shared networks (e.g., `nextcloud_network`).

---

## ðŸ”- Related Documentation

- [Main README](README.md) - Project overview
- [Docker Infrastructure](docker-infrastructure.md) - Architecture patterns
- [Hardware Specs](hardware-specs.md) - Server specifications

---

## Future Additions

Services planned but not yet deployed:

- [ ] Prometheus + Grafana (metrics & dashboards)
- [ ] Uptime Kuma (uptime monitoring)
- [ ] Authentik (SSO/LDAP)
- [ ] Ansible (configuration management)

---

<div align="center">

**Total:** 60+ containers Â· 24 compose files Â· 33TB storage

</div>


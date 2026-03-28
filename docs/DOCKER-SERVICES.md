# 🐳 Docker Services - Complete Inventory

This document provides a complete inventory of all containerized services with links to their compose files.

**Last Updated:** February 17, 2026  
**Total Services:** 60+ containers  
**Total Compose Files:** 24  

---

## 📁 Repository Structure
```
docker/
├── media-management/     # Arr stack + downloaders
├── media-servers/        # Emby, Immich, music
├── productivity/         # Nextcloud, Paperless-ngx
├── development/          # Portfolio projects
├── security/            # Vaultwarden, Pi-hole
├── monitoring/          # Scrutiny, health checks
└── infrastructure/      # Core services
```

---

## 🎬 Media Management

### Arr Stack
**Location:** `docker/media-management/emby-arr/`

Complete media automation stack running behind Gluetun VPN:
- Sonarr (TV shows)
- Radarr (Movies)
- Lidarr (Music)
- Bazarr (Subtitles)
- Prowlarr (Indexers)
- Recyclarr (TRaSH Guides)
- Maintainerr (Cleanup)
- FlareSolverr (Cloudflare)
- qBittorrent (Download client)
- Gluetun (VPN gateway)
- Seerr (Requests)
- Homarr (Dashboard)

**Files:**
- `compose.yaml` - Complete stack definition

---

## 📺 Media Servers

### Immich
**Location:** `docker/media-servers/immich/`

AI-powered photo management with machine learning:
- Server, PostgreSQL, Redis, ML worker

**Files:**
- `docker-compose.yml`

### Emby
**Location:** `docker/media-servers/emby/`

Main media server for movies, TV shows, music.

**Files:**
- `docker-compose.yml`

### Music Services

**Audiobookshelf:** `docker/media-servers/audiobookshelf/`  
**Navidrome:** `docker/media-servers/navidrome/`  
**SwingMusic:** `docker/media-servers/swingmusic/`  

### Other Media

**Pinchflat:** `docker/media-servers/pinchflat/` - YouTube archival  
**Stremio:** `docker/media-servers/stremio/` - Streaming aggregator  

---

## 📝 Productivity

### Nextcloud
**Location:** `docker/productivity/nextcloud/`

Complete cloud suite with:
- Nextcloud server
- Collabora Online (office suite)
- Talk signaling server
- PostgreSQL database
- Redis cache
- NATS messaging

**Files:**
- `compose.yaml`

### Document Management

**Paperless-ngx:** `docker/productivity/big-bear-paperless-ngx/`
- Document OCR and management
- PostgreSQL, Redis, Tika, Gotenberg

**Joplin:** `docker/productivity/big-bear-joplin/`
- Note-taking server with PostgreSQL

**Linkwarden:** `docker/productivity/big-bear-linkwarden/`
- Bookmark manager with PostgreSQL

**Memos:** `docker/productivity/memos/`
- Quick notes

**Wallos:** `docker/productivity/big-bear-wallos/`
- Subscription tracker

---

## 💻 Development

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
**DPlaneOS Website:** `docker/development/dplaneos-website2/` - Nginx project site  
**nginx-cv-final:** `docker/development/nginx-cv-final/` - CV website  

---

## 🔒 Security

### Vaultwarden
**Location:** `docker/security/vaultwarden/`

Self-hosted Bitwarden password manager.

**Files:**
- `docker-compose.yml`

### Pi-hole
**Location:** `docker/security/pihole/`

Network-wide ad blocking and DNS server.

**Files:**
- `docker-compose.yml`

---

## 📊 Monitoring

### Homelab Dashboard
**Location:** `docker/monitoring/homelab-dashboard/`

Custom dashboard with:
- Nginx web server
- PHP-FPM
- System stats display

**Files:**
- `compose.yaml`

### System Monitoring

**Scrutiny:** `docker/monitoring/big-bear-scrutiny/`
- Hard drive health monitoring (S.M.A.R.T)
- InfluxDB for metrics storage

**DockPeek:** `docker/monitoring/big-bear-dockpeek/`
- Container inspection tool

---

## 🔧 Infrastructure

### Core Services

**Newt:** `docker/infrastructure/newt/`
- Pangolin tunnel relay

**nginx:** `docker/infrastructure/nginx/`
- Various web services

**Zelest:** `docker/infrastructure/zelest/`
- Internal service

**SearXNG:** `docker/infrastructure/searxng/`
- Privacy-respecting search engine

**Syncthing:** `docker/infrastructure/syncthing/`
- File synchronization across devices

---

## 📊 Statistics
```
Media Management:     1 stack (12 containers)
Media Servers:        6 services
Productivity:         6 services (15 containers)
Development:          4 projects
Security:             2 services
Monitoring:           4 services
Infrastructure:       5 services
────────────────────────────────────
Total:                24 compose files, 60+ containers
```

---

## 🚀 Deployment

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

## 📝 Notes

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

## 🔗 Related Documentation

- [Main README](README.md) - Project overview
- [Docker Infrastructure](docker-infrastructure.md) - Architecture patterns
- [Hardware Specs](hardware-specs.md) - Server specifications

---

## 🎯 Future Additions

Services planned but not yet deployed:

- [ ] Prometheus + Grafana (metrics & dashboards)
- [ ] Uptime Kuma (uptime monitoring)
- [ ] Authentik (SSO/LDAP)
- [ ] Ansible (configuration management)

---

<div align="center">

**Total:** 60+ containers · 24 compose files · 33TB storage

</div>


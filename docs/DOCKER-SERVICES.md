# Docker Services - Complete Inventory

Complete inventory of all containerized services with links to their compose files.

**Total Compose Files:** 40+

---

## Infrastructure

### Networking

| Service | Compose File | Description |
|---------|-------------|-------------|
| Pi-hole | [pihole.yml](../infrastructure/networking/pihole/pihole.yml) | DNS server with network-wide ad-blocking |
| Newt | [newt.yml](../infrastructure/networking/newt/newt.yml) | Pangolin tunnel client - WireGuard-based reverse proxy to VPS |
| Tailscale DERP | [tailscale-derper.yml](../infrastructure/networking/tailscale-derper/tailscale-derper.yml) | Self-hosted Tailscale relay server |
| Pangolin (VPS) | [docker-compose.yml](../infrastructure/networking/pangolin/terraform/docker-compose.yml) | Pangolin server, Traefik, CrowdSec on VPS |

### Monitoring

| Service | Compose File | Description |
|---------|-------------|-------------|
| Beszel Hub | [beszel.yml](../infrastructure/monitoring/beszel/beszel.yml) | Server resource monitoring hub |
| Beszel Agent | [beszel-agent.yml](../infrastructure/monitoring/beszel-agent/beszel-agent.yml) | Per-host metrics collector |
| Dockge | [dockge.yml](../infrastructure/monitoring/big-bear-dockge/dockge.yml) | Docker Compose stack manager |
| Scrutiny | [scrutiny.yml](../infrastructure/monitoring/big-bear-scrutiny/scrutiny.yml) | S.M.A.R.T disk health monitoring |
| Dockpeek | [dockpeek.yml](../infrastructure/monitoring/big-bear-dockpeek/dockpeek.yml) | Container health dashboard |
| Glances | [glances-dashboard.yml](../infrastructure/monitoring/glances-dashboard.yml) | System resource monitor |

### Security

| Service | Compose File | Description |
|---------|-------------|-------------|
| Vaultwarden | [vaultwarden.yml](../infrastructure/security/vaultwarden/vaultwarden.yml) | Self-hosted Bitwarden server |

### Storage

| Service | Compose File | Description |
|---------|-------------|-------------|
| MinIO | [minio.yml](../infrastructure/storage/minio/minio.yml) | S3-compatible local object storage |

---

## Media

| Service | Compose File | Description |
|---------|-------------|-------------|
| Emby | [arr-suite.yml](../services/media/arr-suite.yml) | Media server for movies, TV, music, anime |
| Sonarr | [arr-suite.yml](../services/media/arr-suite.yml) | TV show automation |
| Radarr | [arr-suite.yml](../services/media/arr-suite.yml) | Movie automation |
| Lidarr | [arr-suite.yml](../services/media/arr-suite.yml) | Music automation |
| Bazarr | [arr-suite.yml](../services/media/arr-suite.yml) | Subtitle automation |
| Prowlarr | [arr-suite.yml](../services/media/arr-suite.yml) | Indexer manager |
| FlareSolverr | [arr-suite.yml](../services/media/arr-suite.yml) | Cloudflare bypass for indexers |
| Recyclarr | [arr-suite.yml](../services/media/arr-suite.yml) | TRaSH Guides profile sync |
| Maintainerr | [arr-suite.yml](../services/media/arr-suite.yml) | Media library cleanup |
| qBittorrent | [arr-suite.yml](../services/media/arr-suite.yml) | Download client (behind Gluetun VPN) |
| Gluetun | [arr-suite.yml](../services/media/arr-suite.yml) | ProtonVPN WireGuard gateway |
| Seerr | [arr-suite.yml](../services/media/arr-suite.yml) | Media request management |
| Audiobookshelf | [books.yml](../services/media/books/books.yml) | Audiobook and podcast server |
| Grimmory | [books.yml](../services/media/books/books.yml) | Ebook library (Booklore-based) |
| Bookkeep | [books.yml](../services/media/books/books.yml) | Book discovery and request manager |
| Readmeabook | [books.yml](../services/media/books/books.yml) | Audiobook request manager |
| Immich | [immich.yml](../services/media/immich/immich.yml) | Self-hosted Google Photos replacement |
| Navidrome | [navidrome.yml](../services/media/navidrome/navidrome.yml) | Music streaming (Subsonic API) |
| SwingMusic | [swingmusic.yml](../services/media/swingmusic/swingmusic.yml) | Self-hosted music player |
| Pinchflat | [pinchflat.yml](../services/media/pinchflat/pinchflat.yml) | YouTube archiver |
| Stremio Server | [stremio.yml](../services/media/stremio/stremio.yml) | Stremio add-on server |

---

## Productivity

| Service | Compose File | Description |
|---------|-------------|-------------|
| Nextcloud | [nextcloud.yml](../services/productivity/nextcloud.yml) | File sync, calendar, contacts, office suite |
| Collabora Online | [nextcloud.yml](../services/productivity/nextcloud.yml) | Office document editing for Nextcloud |
| Nextcloud Talk HPB | [nextcloud.yml](../services/productivity/nextcloud.yml) | High-performance WebRTC signaling backend |
| BentoPDF | [bentopdf.yml](../services/productivity/bentopdf/bentopdf.yml) | PDF tools web app |
| CryptPad | [cryptpad.yml](../services/productivity/cryptpad/cryptpad.yml) | End-to-end encrypted collaborative office suite |
| Glass Keep | [glass-keep.yml](../services/productivity/glass-keep/glass-keep.yml) | Lightweight notes app |
| Librum | [librum.yml](../services/productivity/librum/librum.yml) | Self-hosted ebook reading and library server |
| Revolt.chat | [revolt.yml](../services/productivity/revolt/revolt.yml) | Self-hosted Discord alternative |
| TriliumNext | [trilium.yml](../services/productivity/trilium/trilium.yml) | Hierarchical personal knowledge base |
| Paperless-NGX | [paperless.yml](../services/productivity/big-bear-paperless-ngx/paperless.yml) | Document OCR, archive, and full-text search |
| Joplin Server | [joplin.yml](../services/productivity/big-bear-joplin/joplin.yml) | Note sync backend for Joplin clients |
| Memos | [memos.yml](../services/productivity/memos/memos.yml) | Lightweight microblog-style notes |
| Linkwarden | [linkwarden.yml](../services/productivity/big-bear-linkwarden/linkwarden.yml) | Bookmark archiver with full-page capture |
| Wallos | [wallos.yml](../services/productivity/big-bear-wallos/wallos.yml) | Subscription and expense tracker |

---

## Management

| Service | Compose File | Description |
|---------|-------------|-------------|
| Homarr | [homarr.yml](../services/management/homarr/homarr.yml) | Service dashboard |
| Kasm | [kasm.yml](../services/management/kasm/kasm.yml) | Containerized browser and desktop streaming |
| Heaper | [heaper.yml](../services/management/heaper/heaper.yml) | Docker host resource and container manager |
| Arcane | [arcane.yml](../services/management/arcane/arcane.yml) | Docker management UI |
| Syncthing | [syncthing.yml](../services/management/syncthing/syncthing.yml) | Peer-to-peer file sync |
| SearXNG | [searxng.yml](../services/management/searxng/searxng.yml) | Self-hosted metasearch engine |
| Zelest Stacks | [stacks.yml](../services/management/stacks.yml) | Compose stack management UI |

---

## Development

| Service | Compose File | Description |
|---------|-------------|-------------|
| DPlaneOS Website | [d-planeos-website.yml](../services/development/d-planeos-website.yml) | DPlaneOS marketing website (nginx static) |
| Dan Portfolio | [dan-portfolio.yml](../services/development/dan-portfolio/dan-portfolio.yml) | Personal portfolio site (PHP + Postfix relay) |
| Forgejo | [forgejo.yml](../services/development/forgejo/forgejo.yml) | Self-hosted Git forge |
| Nginx CV | [nginx-cv.yml](../services/development/nginx-cv/nginx-cv.yml) | Personal CV/resume web page |
| Aptifolio | [aptifolio.yml](../services/development/aptifolio.yml) | Next.js + FastAPI + PDF resume parser |

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [docker-infrastructure.md](docker-infrastructure.md) | Container architecture, network design, update procedures |
| [nextcloud-optimization-guide.md](nextcloud-optimization-guide.md) | Nextcloud stack deep-dive |
| [nextcloud-update-guide.md](nextcloud-update-guide.md) | Nextcloud update procedure and occ command sequence |
| [media-stack.md](media-stack.md) | Arr suite and VPN-gated download setup |
| [productivity-services.md](productivity-services.md) | Productivity service overview |

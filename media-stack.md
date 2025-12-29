# Media Management Stack

Complete automated media management system with Arr suite, VPN-secured downloads, and multi-platform streaming.

## 🎬 Architecture

```
Internet
    ↓
Gluetun VPN (Wireguard)
    ↓
qBittorrent ← Prowlarr (Indexer Management)
    ↓           ↓
Download Queue  ↓
    ↓           ↓
Sonarr/Radarr/Lidarr (Automation)
    ↓
Bazarr (Subtitles)
    ↓
Media Storage
    ↓
Emby/SwingMusic (Streaming)
    ↑
Ombi (User Requests)
```

## 📦 Services

### Download Infrastructure

**Gluetun VPN Gateway**
- Provider: Wireguard/OpenVPN
- Kill switch enabled
- Port forwarding: 6881 (TCP/UDP)
- Healthcheck monitoring
- Network isolation for download clients

**qBittorrent**
- Version: Latest LinuxServer.io
- Network: Uses Gluetun container network
- Web UI: Port 8090
- All traffic routed through VPN

**FlareSolverr**
- Cloudflare bypass proxy
- Port: 8191
- Used by Prowlarr for protected indexers

### Content Automation

**Prowlarr** (Port: 9696)
- Centralized indexer management
- Integrates with all Arr services
- FlareSolverr integration for Cloudflare-protected sites

**Sonarr** (Port: 8989)
- TV show automation
- Quality profiles configured
- Episode monitoring & renaming

**Radarr** (Port: 7878)
- Movie automation
- Quality profiles configured
- Automatic movie organization

**Lidarr** (Port: 8686)
- Music automation
- Album monitoring
- Quality profiles for audio formats

**Bazarr** (Port: 6767)
- Automatic subtitle downloads
- Multi-language support
- Integrates with Sonarr/Radarr

### Request Management

**Ombi** (Port: 3579)
- User request interface
- Integrates with Sonarr/Radarr
- Approval workflow
- User management

### Streaming Services

**Emby Server** (Port: 8096)
- Media server for TV shows and movies
- Hardware transcoding enabled
- Remote access configured
- Library organization

**SwingMusic** (Port: 1970)
- Music streaming server
- Modern web interface
- Album organization

**Pinchflat** (Port: 8945)
- YouTube content downloader
- Automated video archival
- Quality selection

**Kavita** (Port: 5000)
- eBook and manga reader
- Library management
- Reading progress tracking

## 🔒 Security Features

1. **VPN Kill Switch:** All download traffic isolated in Gluetun container
2. **Network Isolation:** Download clients can't communicate outside VPN
3. **No Direct Internet Access:** qBittorrent only accessible via Gluetun
4. **Port Forwarding:** Configured for optimal torrent performance

## 📁 Storage Structure

```
/media/
├── tv/              # Managed by Sonarr
├── movies/          # Managed by Radarr
├── music/           # Managed by Lidarr
├── books/           # Managed by Kavita
└── downloads/       # qBittorrent download directory
```

## ⚙️ Configuration Highlights

- **Quality Profiles:** Optimized for 1080p with selective 4K
- **Naming Scheme:** Plex-compatible naming conventions
- **Monitoring:** Automated health checks for all services
- **Backup:** Configuration backups automated via scripts

## 🔗 Inter-Service Communication

All services communicate via Docker networks:
- **arr-network:** Shared network for Arr services
- **gluetun-network:** Isolated network for VPN-routed traffic

## 📊 Resource Usage

- **CPU:** Minimal during idle, spikes during transcoding
- **RAM:** ~4-6 GB for entire media stack
- **Disk I/O:** Moderate during downloads, low during streaming

## 🚀 Deployment

All services deployed via Docker Compose. See `/docker-compose/media/` for complete configurations.

## 🔧 Maintenance

- **Updates:** Automated via Watchtower (weekly schedule)
- **Logs:** Rotated automatically, 7-day retention
- **Health Checks:** Monitored via Uptime Kuma

---

**Key Features:**
- ✅ Fully automated download-to-streaming pipeline
- ✅ VPN-secured downloads with kill switch
- ✅ Multi-user request system
- ✅ Automatic subtitle downloads
- ✅ Quality control and organization

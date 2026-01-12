# 🏠 Homelab Infrastructure

[![Status](https://img.shields.io/badge/status-production-success?style=for-the-badge)](https://github.com/4nonX/homelab)
[![Uptime](https://img.shields.io/badge/uptime-99.9%25-brightgreen?style=for-the-badge)](https://github.com/4nonX/homelab)
[![Services](https://img.shields.io/badge/services-40+-blue?style=for-the-badge)](https://github.com/4nonX/homelab)
[![Storage](https://img.shields.io/badge/storage-33TB-orange?style=for-the-badge)](https://github.com/4nonX/homelab)
[![Migration](https://img.shields.io/badge/NixOS_Migration-Planning-yellow?style=for-the-badge)](NIXOS-MIGRATION.md)

> **Production-grade personal cloud infrastructure** built from scratch, demonstrating enterprise-level architecture, security, and operational practices at homelab scale.

---

## 🚧 Current Major Project: NixOS Migration (2026)

I'm currently planning and executing a **complete infrastructure migration** 
from ZimaOS (Debian-based) to NixOS for my entire production homelab.

**Why NixOS?**
- 🔧 Declarative system configuration (Infrastructure as Code at OS level)
- ♻️ Atomic rollbacks and reproducible builds
- 📦 Better separation of system state and configuration
- 🔄 Simplified disaster recovery through "system as code"

**Migration Strategy:**
- Zero-downtime target for critical services
- Service-by-service migration with rollback capability  
- Data migration strategy for 33TB BTRFS RAID5
- Comprehensive documentation of process and learnings

**Current Status:** Planning Phase | Target: Q2-Q3 2026
---

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)  
- [Services](#-services)
- [Documentation](#-documentation)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)

---

## 🎯 Overview

**What:** Self-hosted cloud infrastructure replacing €580+/year in SaaS subscriptions  
**Scale:** 40+ containerized services, 33TB storage, 99.9%+ uptime  
**Goal:** Complete data ownership, unlimited storage, learning experience  
**Result:** Enterprise-grade infrastructure at homelab cost

### Key Features

✅ **Zero Port Forwarding** - Secure external access via self-hosted [Pangolin](https://github.com/fosrl/pangolin) tunnel  
✅ **Automatic SSL** - Let's Encrypt certificates managed by [Traefik](https://traefik.io/)  
✅ **Multi-Layer Security** - CrowdSec IDS/IPS, encryption, network isolation  
✅ **Container-First** - Docker Compose orchestration  
✅ **High Availability** - RAID5 storage, automated backups, monitoring  
✅ **Cost Effective** - Break-even in 3.5 years vs. SaaS

### Hardware

```
Server Specifications:
├─ CPU: Intel Core i3-13100 (4C/8T, up to 4.5 GHz)
├─ RAM: 32 GB DDR4-3200
├─ Storage: 33TB BTRFS RAID5 + 120GB NVMe
├─ OS: ZimaOS v1.5.2 (Ubuntu 24.04 base)
└─ Power: ~30W average, ~60W peak

VPS Gateway (External Access):
├─ Provider: IONOS (Berlin, Germany)
├─ Specs: 2 vCPU, 2GB RAM, 80GB NVMe
└─ Stack: Pangolin + Traefik + CrowdSec
```

---

## 🚀 Quick Start

### For Recruiters/Employers

Start here to understand the project scope and skills demonstrated:

1. 📊 **[Executive Summary](EXECUTIVE_SUMMARY.md)** - Quick overview and key achievements
2. 🎯 **[Portfolio Showcase](PORTFOLIO.md)** - Skills and technical implementation
3. 📖 **[Complete Journey](homelab-complete-journey.md)** - Full build story (1,790 lines!)

### For Technical Deep-Dive

Explore specific technical implementations:

- **[Hardware Specifications](hardware-specs.md)** - DIY build details and performance
- **[Docker Infrastructure](docker-infrastructure.md)** - Container architecture and best practices
- **[Remote Access Strategy](network-remote-access.md)** - Multi-layered VPN architecture, Pangolin/Tailscale/ZeroTier comparison, security integration
- **[Pangolin Tunnel](pangolin-infrastructure.md)** - Self-hosted external access solution
- **[Network Security](network-security.md)** - Multi-layer security architecture
  
---

## 🏗️ Architecture

### System Diagram

```
Internet
    │
    ├─── VPS (Public IP: Berlin, Germany)
    │      ├─ Traefik (HTTPS Proxy)
    │      ├─ Pangolin (API Server)
    │      ├─ Gerbil (Wireguard)
    │      └─ CrowdSec (Security)
    │           ↓
    │      [Wireguard Tunnel - Encrypted]
    │           ↓
    └─── Home Network (10.XXX.0.0/24)
           │
           ├─ NAS Server (10.XXX.0.1)
           │   ├─ Newt Client (Tunnel)
           │   ├─ Docker (40+ containers)
           │   └─ Storage (33TB RAID5)
           │
           ├─ Pi-hole (10.XXX.0.2)
           │   └─ DNS + Ad-blocking
           │
           └─ Client Devices
               └─ Workstations, Mobile
```

### Security Layers

```
Layer 1: VPS Perimeter
  ├─ UFW Firewall
  ├─ CrowdSec IDS/IPS
  └─ DDoS Protection

Layer 2: Encrypted Transport
  ├─ Wireguard Tunnel
  ├─ TLS 1.3 (Traefik)
  └─ Let's Encrypt SSL

Layer 3: Network Isolation
  ├─ Docker Networks
  ├─ Service Segmentation
  └─ Database Isolation

Layer 4: Application Security
  ├─ Service Authentication
  ├─ 2FA (where available)
  └─ Access Control

Layer 5: Data Protection
  ├─ BTRFS Checksumming
  ├─ RAID5 Redundancy
  └─ Encrypted Backups
```

---

## 📦 Services

### Media Management (12 containers)

| Service | Purpose | Link |
|---------|---------|------|
| **Emby** | Media server | [emby.media](https://emby.media/) |
| **Sonarr** | TV automation | [sonarr.tv](https://sonarr.tv/) |
| **Radarr** | Movie automation | [radarr.video](https://radarr.video/) |
| **Lidarr** | Music automation | [lidarr.audio](https://lidarr.audio/) |
| **Prowlarr** | Indexer mgmt | [prowlarr.com](https://prowlarr.com/) |
| **Bazarr** | Subtitles | [bazarr.media](https://www.bazarr.media/) |
| **qBittorrent** | Downloads | [qbittorrent.org](https://www.qbittorrent.org/) |
| **Gluetun** | VPN gateway | [GitHub](https://github.com/qdm12/gluetun) |
| **SwingMusic** | Music player | [GitHub](https://github.com/swingmx/swingmusic) |
| **Kavita** | eBook reader | [kavitareader.com](https://www.kavitareader.com/) |
| **Pinchflat** | YouTube archive | [GitHub](https://github.com/kieraneglin/pinchflat) |
| **Ombi** | Requests | [ombi.io](https://ombi.io/) |

### Productivity & Cloud (15 containers)

| Service | Purpose | Link |
|---------|---------|------|
| **Nextcloud** | File sync/share | [nextcloud.com](https://nextcloud.com/) |
| **Immich** | Photo mgmt | [immich.app](https://immich.app/) |
| **Paperless-NGX** | Document OCR | [docs.paperless-ngx.com](https://docs.paperless-ngx.com/) |
| **Vaultwarden** | Password mgr | [GitHub](https://github.com/dani-garcia/vaultwarden) |
| **Joplin Server** | Note sync | [joplinapp.org](https://joplinapp.org/) |
| **Memos** | Quick notes | [usememos.com](https://usememos.com/) |
| **Linkwarden** | Bookmarks | [linkwarden.app](https://linkwarden.app/) |
| **Cal.com** | Scheduling | [cal.com](https://cal.com/) |
| **Audiobookshelf** | Audiobooks | [audiobookshelf.org](https://www.audiobookshelf.org/) |
| **Stirling-PDF** | PDF tools | [GitHub](https://github.com/Stirling-Tools/Stirling-PDF) |

### Security & Network (4 containers)

| Service | Purpose | Link |
|---------|---------|------|
| **Pi-hole** | DNS + Ad-block | [pi-hole.net](https://pi-hole.net/) |
| **Pangolin** | Tunnel server | [GitHub](https://github.com/fosrl/pangolin) · [Docs](https://docs.pangolin.net) |
| **Gerbil** | WG gateway | [GitHub](https://github.com/fosrl/pangolin) |
| **CrowdSec** | IDS/IPS | [crowdsec.net](https://www.crowdsec.net/) |

### Infrastructure (14 containers)

| Service | Purpose | Link |
|---------|---------|------|
| **Traefik** | Reverse proxy | [traefik.io](https://traefik.io/) · [Docs](https://doc.traefik.io/traefik/) |
| **Dockge** | Container mgmt | [GitHub](https://github.com/louislam/dockge) |
| **Syncthing** | File sync | [syncthing.net](https://syncthing.net/) |
| **PostgreSQL** | Database (8x) | [postgresql.org](https://www.postgresql.org/) |
| **Redis** | Cache (3x) | [redis.io](https://redis.io/) |

---

## 📚 Documentation

### Primary Documentation

| Document | Description | Lines | Read Time |
|----------|-------------|-------|-----------|
| **[📊 Executive Summary](EXECUTIVE_SUMMARY.md)** | Quick reference | 300 | 5 min |
| **[🎯 Portfolio](PORTFOLIO.md)** | Skills showcase | 400 | 8 min |
| **[📖 Complete Journey](homelab-complete-journey.md)** | Full story | 1,790 | 45 min |
| **[📇 Index](INDEX.md)** | Doc index | 250 | 5 min |

### Technical Documentation

| Category | Documents |
|----------|-----------|
| **Hardware** | [Hardware Specs](hardware-specs.md) |
| **Docker** | [Docker Infrastructure](docker-infrastructure.md) |
| **Services** | [Media Stack](media-stack.md) · [Productivity](productivity-services.md) |
| **Network** | [Network Security](network-security.md) · [Remote Access](remote-access.md) |
| **Pangolin** | [Infrastructure](pangolin-infrastructure.md) · [Configs](pangolin-configurations.md) · [Deployment](pangolin-deployment-guide.md) |

---

## 🛠️ Tech Stack

### Core Technologies

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)
![Ubuntu](https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)
![Traefik](https://img.shields.io/badge/Traefik-24A1C1?style=for-the-badge&logo=traefikproxy&logoColor=white)
![Wireguard](https://img.shields.io/badge/Wireguard-88171A?style=for-the-badge&logo=wireguard&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

- **Container Orchestration:** Docker Compose
- **Reverse Proxy:** Traefik v3 with automatic SSL
- **Tunnel:** [Pangolin](https://github.com/fosrl/pangolin) (self-hosted)
- **VPN:** Wireguard
- **Storage:** BTRFS on mdadm RAID5
- **Security:** CrowdSec IDS/IPS
- **DNS:** Pi-hole

---

## 💰 Cost Analysis

### Investment & Operating Costs

```
Initial Investment:
  Hardware:          €1,290
  VPS (3y):            €180
  Domain (3y):          €36
  ───────────────────────
  Total:            €1,506

Annual Operating:
  Electricity:         €75
  VPS:                 €60
  Domain:              €12
  ───────────────────────
  Total:              €147/year (€12/month)
```

### Replaced SaaS Services

```
Before (Annual):
  Google One:          €30
  Dropbox Plus:       €120
  1Password:           €60
  Spotify:            €180
  Netflix:            €156
  iCloud+:             €36
  ───────────────────────
  Total:              €582/year

Savings: €582/year - €147/year = €435/year
```

### ROI Timeline

```
Year 1:  -€1,071  (investment)
Year 2:    -€636  (cumulative)
Year 3:    -€201  (cumulative)  
Year 4:    +€234  ✅ Break-even!
Year 5:    +€669  (profit)
```

---

## 🎓 Skills Demonstrated

### Infrastructure
- Hardware selection & assembly
- Linux system administration (Ubuntu/ZimaOS)
- Storage architecture (BTRFS, RAID5)
- Performance optimization

### Networking
- Multi-server architecture (VPS + Homelab)
- VPN tunneling (Wireguard)
- Reverse proxy (Traefik + SSL)
- DNS management (Pi-hole)
- Network segmentation

### Security
- Defense in depth (6 layers)
- IDS/IPS (CrowdSec)
- Encryption (data at rest & in transit)
- Access control & hardening
- Security monitoring

### DevOps
- Docker & Docker Compose
- Infrastructure as Code
- Automated backups
- CI/CD concepts (Watchtower)
- Monitoring & logging

### Documentation
- Technical writing (5,000+ lines)
- Architecture diagrams
- Deployment guides
- Best practices

---

## 📈 Statistics

```
Timeline:           6+ months
Services:           40+ containers
Storage:            33TB RAID5 (10% used)
RAM:                32GB (31% used)
Uptime:             99.9%+
Power:              30W avg, 60W peak
Documentation:      5,000+ lines, 17 files
```

---

## 🚀 Getting Started

### Learn More

1. Read the **[Complete Journey](homelab-complete-journey.md)** - Full walkthrough
2. Follow **[Pangolin Deployment Guide](pangolin-deployment-guide.md)** - Step-by-step
3. Check **[Docker Best Practices](docker-infrastructure.md)** - Architecture patterns

### Community Resources

- **r/selfhosted:** [reddit.com/r/selfhosted](https://reddit.com/r/selfhosted)
- **r/homelab:** [reddit.com/r/homelab](https://reddit.com/r/homelab)
- **Awesome Selfhosted:** [github.com/awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted)

---

## 🙏 Acknowledgments

Special thanks to:

- **[Pangolin](https://github.com/fosrl/pangolin)** - Self-hosted tunnel solution
- **[LinuxServer.io](https://linuxserver.io)** - Quality container images
- **[Traefik](https://traefik.io/)** - Modern reverse proxy
- **[CrowdSec](https://crowdsec.net)** - Community security
- All open-source self-hosted projects

---

## 📄 License

This documentation is available for **educational purposes**.

✅ Reference and learn from this architecture  
✅ Adapt concepts for your own projects  
⚠️ Replace all placeholder values before use

---

## 📞 Connect

[![GitHub](https://img.shields.io/badge/GitHub-4nonX-181717?style=for-the-badge&logo=github)](https://github.com/4nonX)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/dan-dressen)

---

<div align="center">

**Built with** ❤️ **and** ☕

**Powered by** 🐳 Docker · 🐧 Linux · 🔒 Self-Hosted

⭐ **Star this repo if you found it useful!** ⭐

</div>

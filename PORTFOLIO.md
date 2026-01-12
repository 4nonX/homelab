# Homelab Infrastructure Portfolio

> **Self-hosted infrastructure demonstrating Docker orchestration, network security, and system administration expertise**

## 👋 About This Project

This repository documents my personal homelab infrastructure, showcasing practical experience in:
- Docker containerization and orchestration
- Network architecture and security
- Linux system administration
- Self-hosted service deployment
- Infrastructure automation

## 🎯 Project Overview

**Platform:** DIY NAS Build (Intel i3-13100, 32GB RAM) running ZimaOS  
**Scale:** 40+ containerized services across multiple categories  
**Uptime:** ~90%+ with automated monitoring and health checks  
**Storage:** BTRFS on RAID5 (33TB) with compression and checksumming  
**External Access:** Self-hosted Pangolin tunnel with Traefik reverse proxy (VPS-based)

## 🚧 Current Major Project: NixOS Migration (2026)

I'm planning and executing a **complete infrastructure migration** from ZimaOS (Debian) to NixOS for my entire 40+-service production environment.

**Why NixOS?**
- 🔧 Declarative system configuration (Infrastructure as Code at OS level)
- ♻️ Atomic rollbacks and reproducible builds  
- 📦 Separation of system state and configuration
- 🔄 Simplified disaster recovery through "system as code"

**Migration Strategy:**
- Zero-downtime target for critical services
- Service-by-service migration with rollback capability
- Data migration for 33TB BTRFS RAID5 storage
- Comprehensive documentation of entire process

**Current Phase:** Planning & Testing | **Target:** Q2-Q3 2025

📖 **[Read Full Migration Plan →](NIXOS-MIGRATION.md)**

**What This Demonstrates:**
- Production change management and risk assessment
- Modern Infrastructure-as-Code practices beyond containers
- Complex project planning and execution
- Technical decision-making for system architecture
----

## 🏗️ Technical Architecture

### Infrastructure Highlights

- **Containerization:** Docker-based deployment with 40+ services
- **Orchestration:** Docker Compose with stack-based organization
- **Networking:** Segmented Docker networks with VPN integration
- **External Access:** Self-hosted Pangolin tunnel (Wireguard) with Traefik reverse proxy
- **Security:** Multi-layered defense with CrowdSec IDS/IPS and encryption
- **Storage:** BTRFS RAID5 (33TB) with compression and self-healing
- **Monitoring:** Health checks, logging, and planned observability stack

### Service Categories

#### 📺 Media Library & Streaming
Personal media server infrastructure with organized library management:
* Library organization tools (metadata, quality profiles, automation)
* Emby streaming server with Intel Quick Sync transcoding
* Household request and sharing workflow

#### 🛠️ Productivity Suite
Self-hosted alternatives to cloud services:
- Nextcloud (file sync and collaboration)
- Immich (AI-powered photo management)
- Paperless-NGX (document OCR and management)
- Vaultwarden (password manager)
- Joplin Server & Memos (note-taking)

#### 🔒 Security Infrastructure
- Pi-hole (network-wide DNS and ad-blocking)
- Gluetun (VPN gateway with kill-switch)
- Container isolation via Docker networks
- BTRFS RAID5 data integrity

#### 🌐 External Access (Pangolin Tunnel)
- **VPS Gateway:** IONOS Berlin (2vCPU, 2GB RAM)
- **Pangolin Server:** API and management dashboard
- **Gerbil:** Wireguard tunnel gateway
- **Traefik:** Reverse proxy with automatic Let's Encrypt SSL
- **CrowdSec:** IDS/IPS with DDoS protection
- **Newt Client:** Homelab tunnel agent (systemd service)
- **Result:** Secure external access without port forwarding

#### 🔧 Management & Operations
- Dockge (Docker stack management)
- Syncthing (decentralized file sync)
- Automated backups with testing
- Health monitoring and logging

## 💻 Technical Skills Demonstrated

### Docker & Containerization
- Multi-container application stacks
- Docker Compose orchestration
- Container networking and isolation
- Volume and data management
- Security hardening (non-root users, resource limits)
- Health checks and monitoring

### Linux System Administration
- ZimaOS/Ubuntu-based system management
- BTRFS and mdadm RAID management
- Network configuration and routing
- Firewall setup (UFW)
- Service management and automation
- Performance monitoring and optimization

### Network Engineering
- Docker network architecture
- VPN integration and routing (Wireguard)
- DNS server configuration (Pi-hole)
- Reverse proxy deployment (Traefik with SSL automation)
- Tunnel infrastructure (Pangolin self-hosted alternative)
- Network segmentation
- Port management and security
- Multi-server networking (VPS + Homelab)

### Security Practices
- Defense in depth architecture
- Encryption at rest (LUKS/filesystem-level) and in transit (TLS)
- VPN kill-switch implementation
- Container security (capabilities, read-only FS)
- Secrets management
- Regular security updates

### DevOps Practices
- Infrastructure as Code (Docker Compose)
- Automated backups with verification
- Monitoring and logging
- Update automation (Watchtower)
- Documentation as code
- Disaster recovery planning

## 📚 Documentation

Comprehensive documentation covering all aspects of the infrastructure:

- **[README.md](README.md)** - Project overview and quick start
- **[hardware-specs.md](hardware-specs.md)** - Detailed hardware configuration
- **[docker-infrastructure.md](docker-infrastructure.md)** - Docker deployment and best practices
- **[media-stack.md](media-stack.md)** - Media management pipeline
- **[productivity-services.md](productivity-services.md)** - Self-hosted productivity tools
- **[network-security.md](network-security.md)** - Network architecture and security

## 🔨 Technical Implementation

### Docker Compose Example (Media Stack)
```yaml
version: '3.8'

services:
  gluetun:
    image: qmcgaw/gluetun
    cap_add:
      - NET_ADMIN
    devices:
      - /dev/net/tun
    environment:
      - VPN_SERVICE_PROVIDER=custom
      - VPN_TYPE=wireguard
    ports:
      - "8090:8080"  # qBittorrent WebUI
      - "6881:6881"  # Torrent port
    healthcheck:
      test: ["CMD", "wget", "--spider", "https://cloudflare.com"]
      interval: 30s
    restart: unless-stopped

  qbittorrent:
    image: linuxserver/qbittorrent
    network_mode: "service:gluetun"  # Route through VPN
    volumes:
      - ./config:/config
      - /media/downloads:/downloads
    depends_on:
      gluetun:
        condition: service_healthy
    restart: unless-stopped
```

### Network Architecture
```
Internet → Router → Pi-hole (DNS) → Services
                                   ↓
                            Docker Networks:
                            ├─ Media Network
                            ├─ Productivity Network
                            ├─ Database Network
                            └─ VPN Network (Gluetun)
```

## 📊 Project Statistics

- **Total Services:** 40+ active containers
- **Uptime:** 99.9%+ (monitored via health checks)
- **Storage:** 33TB BTRFS RAID5 storage
- **Power Consumption:** ~30W average (energy efficient)
- **Network Traffic:** ~500K DNS queries/day (Pi-hole)
- **Automation:** Automated updates, backups, and monitoring

## 🚀 Future Enhancements

### Short-term
- [ ] Implement reverse proxy (Nginx Proxy Manager/Traefik)
- [ ] Deploy monitoring stack (Prometheus + Grafana)
- [ ] Set up centralized logging (Loki)
- [ ] Configure automated SSL certificates

### Long-term
- [ ] Implement container orchestration (K3s)
- [ ] Build CI/CD pipeline for infrastructure
- [ ] Advanced security monitoring (IDS/IPS)
- [ ] Multi-site replication for DR

## 🎓 Learning Outcomes

This project demonstrates proficiency in:

✅ **Container Technologies:** Docker, Docker Compose, container security  
✅ **Linux Administration:** System management, BTRFS RAID5, networking, security  
✅ **Infrastructure Automation:** IaC, automated backups, monitoring  
✅ **Network Engineering:** VPN, DNS, network segmentation, firewalls  
✅ **Security:** Defense in depth, encryption, access control  
✅ **Documentation:** Comprehensive technical documentation  
✅ **Problem Solving:** Troubleshooting complex multi-service deployments

## 📞 Contact

This portfolio demonstrates practical DevOps and infrastructure skills. For professional inquiries or technical discussions about this implementation, please connect via:

- **GitHub:** (https://github.com/4nonX/)
- **LinkedIn:** (https://www.linkedin.com/in/dan-dreßen-b83b1839a/)
- **Email:** [dan.dressen@d-net.me]

## 📄 License

This documentation is shared for educational and portfolio purposes. Service configurations may contain references to third-party software - please refer to their respective licenses.

---

**Note:** This is a living project that continues to evolve. Check back for updates as new services are added and infrastructure improvements are implemented.

**Stack:** Docker · Linux · BTRFS RAID5 · Networking · Security · Self-Hosting

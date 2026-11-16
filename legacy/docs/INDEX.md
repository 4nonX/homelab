# Complete Documentation Index

### 🎯 Start Here

1. **[EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)** - Quick reference guide
   - At-a-glance overview
   - Key achievements
   - Business value
   - Quick stats

2. **[NIXOS-MIGRATION.md](NIXOS-MIGRATION.md)** - Ongoing Project showcase
   - NixOS-Migration - reasoning
   - NixOS - features
   - NixOS - migration steps

3. **[PORTFOLIO.md](PORTFOLIO.md)** - Portfolio showcase
   - Skills demonstration
   - Technical implementation
   - GitHub-optimized presentation

4. **[README.md](README.md)** - Project overview
   - Infrastructure highlights
   - Service categories
   - Repository structure

### 📖 Complete Story

5. **[homelab-complete-journey.md](homelab-complete-journey.md)** - Full build journey (1790 lines!)
   - Why build a personal cloud?
   - Requirements & planning
   - Hardware selection & build
   - OS selection & installation
   - Storage architecture (BTRFS RAID5)
   - Network design
   - Service deployment strategy
   - External access solution (Pangolin)
   - Security implementation
   - Monitoring & maintenance
   - Business case & ROI
   - Lessons learned
   - Scaling to enterprise

6. **[homelab-dashboard-guide.md](homelab-dashboard-guide.md)** - Dashboard setup and usage

### 🔧 Technical Deep-Dives

7. **[hardware-specs.md](hardware-specs.md)** - Hardware documentation
   - Complete component list
   - Selection rationale
   - Performance benchmarks
   - Upgrade paths

8. **[docker-infrastructure.md](docker-infrastructure.md)** - Container architecture
   - Docker Compose strategy
   - Network architecture
   - Security best practices
   - Resource management
   - Update procedures

9. **[network-security.md](network-security.md)** - Network & security
   - Network topology
   - Security layers
   - Firewall configuration
   - Monitoring setup

10. **[nextcloud-optimization-guide.md](nextcloud-optimization-guide.md)** - Docker & database setup
    - Features
    - Prerequisites
    - Architecture
    - Docker Compose stack
    - Talk signaling configuration
    - Reverse proxy & exposure
    - Troubleshooting
    - Maintenance
    - Design decisions & tradeoffs
    - Failure modes & recovery
    - FAQ

11. **[nextcloud-update-guide.md](nextcloud-update-guide.md)** - Updating Nextcloud in Docker
    - Pre-update backup and maintenance mode
    - Ordered post-update occ command sequence
    - Diagnosing container failures
    - 502/504 errors behind Traefik/Pangolin
    - Redis/memcache failure recovery
    - Full command reference
    - Verification checklist

### 📺 Service Categories

12. **[media-stack.md](media-stack.md)** - Media automation
    - Arr Suite integration
    - VPN-secured downloads
    - Streaming services
    - Quality profiles

13. **[productivity-services.md](productivity-services.md)** - Productivity apps
    - Nextcloud setup
    - Immich photo management
    - Paperless-NGX documents
    - Password management

14. **[DOCKER-SERVICES.md](DOCKER-SERVICES.md)** - Full service inventory
    - Complete catalogue of all running containers
    - Service categories, images, and purposes

### 🌐 External Access (Pangolin)

15. **[network-remote-access.md](network-remote-access.md)** - Remote Access Strategy
    - Multi-layered VPN architecture
    - Pangolin/Tailscale/ZeroTier comparison
    - Security integration

16. **[pangolin-infrastructure.md](pangolin-infrastructure.md)** - Complete architecture
    - Why Pangolin?
    - Multi-layer security
    - Performance characteristics
    - Cost analysis

17. **[pangolin-configurations.md](pangolin-configurations.md)** - Sanitized configs
    - Docker Compose files
    - Server configuration
    - Client setup
    - Troubleshooting

18. **[pangolin-deployment-guide.md](pangolin-deployment-guide.md)** - Step-by-step-deployment
    - VPS setup
    - DNS configuration
    - Server deployment
    - Client installation
    - Security hardening

19. **[pangolin-traefikdashboard-guide.md](pangolin-traefikdashboard-guide.md)** - Traefik dashboard behind Pangolin
    - Enabling the Traefik API and dashboard
    - Securing the dashboard route via Pangolin

20. **[pangolin-upgrade-guide.md](pangolin-upgrade-guide.md)** - Step-by-step-upgrade
    - Architecture versions
    - Migrating from v1.12.2 to v1.14.1
    - Technical execution
    - Docker Compose configuration
    - Verification & validation
    - Migration timeline
    - Rollback procedure
    - Performance improvements
    - Key changes in v1.14.1
    - Major version update considerations
    - Troubleshooting
    - Related documentation
    - Resources

21. **[pangolin-vps-relay-guide.md](pangolin-vps-relay-guide.md)** - Raspberry-Pi as Pangolin Brain
    - Architecture overview
    - Phase 1: Hardware & OS setup
    - Phase 2: Network mounting (Static IP)
    - Phase 3: Installing the Pangolin Brain
    - Phase 4: Configuring the VPS-Relay
    - Phase 5: Live cutover
    - Pro/Con analysis

22. **[pangolin-z-performance-tuning.md](pangolin-z-performance-tuning.md)** - Mitigating Pangolin latency issues
    - WireGuard MTU optimization
    - WireGuard persistent keepalive
    - Traefik timeout optimization
    - Disable Traefik access logs
    - CrowdSec log level
    - NVMe I/O scheduler (NAS only)
    - TCP window scaling (network performance)

23. **[pangolin-ha-setup.md](pangolin-ha-setup.md)** - Active-passive HA failover for Pangolin
    - Architecture overview (primary + standby VPS)
    - Litestream continuous SQLite replication to Backblaze B2
    - Wildcard certificates via Cloudflare DNS-01 on both nodes
    - Automatic failover via Cloudflare API (RTO ~7-8 min)
    - Manual failback script with write-preserving DB handover
    - Operational notes: split-brain, EE licensing, maintenance windows
    - Troubleshooting: cert issuance, Litestream, CrowdSec, SMTP, DNS API

### 🗂 Architecture & Diagrams

24. **[architecture-diagram.html](architecture-diagram.html)** - Overall system architecture  
25. **[dataflow-diagram.html](dataflow-diagram.html)** - Service data flows  
26. **[security-diagram.html](security-diagram.html)** - Security layers & controls



# Network & Security Infrastructure

Core network services providing DNS, ad-blocking, VPN access, and security monitoring for the homelab.

## Interactive Security Architecture

**[â†’ View Complete Security Diagram](https://4nonx.github.io/homelab/security-diagram.html)**

This diagram shows our 6-layer defense-in-depth strategy with interactive hover effects.

---

## ðŸŒ Network Architecture

### Core Network Services

**Pi-hole**
- Version: 2025.07.1
- Functions:
  - DNS server for entire network
  - Network-wide ad blocking
  - DHCP server (optional)
  - DNS query logging
  - Local DNS records
- Features:
  - Gravity database (blocklists)
  - Query filtering and analytics
  - Whitelist/blacklist management
  - DNSSEC validation
- Performance:
  - ~500K queries/day handled
  - <10ms query response time
  - 25-30% queries blocked

### VPN Infrastructure

**Gluetun VPN Gateway**
- Multi-protocol VPN client container
- Supported protocols:
  - Wireguard
  - OpenVPN
- Features:
  - Kill switch (blocks non-VPN traffic)
  - Port forwarding support
  - Health check monitoring
  - Multiple provider support
- Use cases:
  - Secure download client traffic
  - Container-level VPN routing
  - Split-tunneling for selective services

**Network Routing:**
```
Application â†’ Gluetun â†’ VPN Provider â†’ Internet
           â†“
    Kill Switch Active
    (No direct internet access)
```

### Reverse Proxy & External Access (Pangolin Tunnel)

**Deployed Solution: Pangolin + Traefik**

**Architecture:**
```
Internet â†’ VPS (IONOS Berlin)
           â”œâ”€ Traefik (Reverse Proxy + SSL)
           â”œâ”€ Pangolin (Server API)
           â”œâ”€ Gerbil (Wireguard Gateway)
           â””â”€ CrowdSec (IDS/IPS)
                â†“
           Wireguard Tunnel (Encrypted)
                â†“
           Homelab (Behind NAT)
           â””â”€ Newt (Client Service)
              â””â”€ Local Services
```

**Key Features:**
- No port forwarding required on homelab router
- Automatic Let's Encrypt SSL certificates
- Wireguard encrypted tunnel
- DDoS protection via CrowdSec
- Web-based service management
- Multi-service routing via Traefik

**VPS Specifications:**
- Provider: IONOS (Berlin, Germany)
- CPU: 2 vCores
- RAM: 2 GB
- Storage: 80 GB NVMe SSD
- Cost: ~â‚¬5-10/month

**Benefits Over Traditional Approaches:**
- No router configuration needed
- No static IP or DDNS required
- Enterprise-grade SSL management
- Integrated security monitoring
- Professional subdomain routing
- Zero-trust network access

*See [pangolin-infrastructure.md](pangolin-infrastructure.md) for complete architecture documentation.*

### File Synchronization

**Syncthing**
- Version: 1.29.7 (LinuxServer.io)
- Features:
  - Decentralized file sync
  - End-to-end encryption
  - Versioning and conflict resolution
  - Cross-platform support
- Sync Folders:
  - Configuration backups
  - Document sync
  - Photo backup (pre-Immich)
- Ports:
  - 8384: Web GUI
  - 22000: Sync protocol (TCP/UDP)
  - 21027: Local discovery (UDP)

## Security Layers

### Network Security

**Firewall Configuration**
- UFW (Uncomplicated Firewall) enabled
- Default policies:
  - Incoming: DENY
  - Outgoing: ALLOW
  - Routed: DENY
- Allowed services:
  - SSH (key-based only)
  - HTTP/HTTPS (for services)
  - DNS (Pi-hole)
  - Custom service ports

**Port Exposure Strategy:**
- Internal network: Full access to all services
- External access: Selective via VPN or reverse proxy
- No direct port forwarding for sensitive services

### Container Security

**Docker Security Practices:**
1. **Network Isolation:**
   - Separate Docker networks per stack
   - Database containers in isolated networks
   - VPN-routed containers use Gluetun network

2. **Resource Limits:**
   - Memory limits on all containers
   - CPU quotas for resource-intensive services
   - Disk quotas via Docker storage drivers

3. **Image Security:**
   - Official images prioritized
   - LinuxServer.io images (trusted community)
   - Regular vulnerability scanning (planned)
   - Image pinning with version tags

4. **Secrets Management:**
   - Environment variables for non-sensitive config
   - Docker secrets for passwords
   - Encrypted backup of sensitive configs

### Access Control

**Authentication Layers:**
- Service-level authentication (native)
- Network-level access control (VPN)
- Host-level authentication (SSH keys only)

**Password Policies:**
- Minimum 16 characters
- Unique per service (managed via Vaultwarden)
- 2FA enabled where supported

### Monitoring & Logging

**Current Setup:**
- Docker logs (7-day retention)
- System logs (journald)
- Service-specific logs

**Planned Monitoring:**
- **Uptime Kuma:** Service availability monitoring
- **Prometheus + Grafana:** Metrics and dashboards
- **Loki:** Log aggregation
- **Alerting:** Email/Push notifications for issues

## Encryption

### Data at Rest
- **ZFS native encryption:** All datasets encrypted
- **Database encryption:** PostgreSQL transparent data encryption
- **Backup encryption:** GPG for all backup files

### Data in Transit
- **HTTPS:** All web services (via reverse proxy)
- **VPN encryption:** Wireguard/OpenVPN
- **SSH:** Key-based only, no password auth
- **Docker TLS:** Secure daemon communication

## Network Topology

```
Internet
    â†“
Router/Firewall
    â†“
    â”œâ”€â”€â”€ Pi-hole (DNS + Ad Blocking)
    â†“
Switch
    â†“
    â”œâ”€â”€â”€ NAS Server (10.243.0.1)
    â”‚     â”œâ”€â”€â”€ Docker Bridge Networks
    â”‚     â”‚     â”œâ”€â”€â”€ Media Stack Network
    â”‚     â”‚     â”œâ”€â”€â”€ Productivity Network
    â”‚     â”‚     â”œâ”€â”€â”€ Infrastructure Network
    â”‚     â”‚     â””â”€â”€â”€ Gluetun VPN Network
    â”‚     â””â”€â”€â”€ Host Network Services
    â”‚
    â”œâ”€â”€â”€ Wireguard VPN Server (Remote Access)
    â””â”€â”€â”€ Client Devices
```

### IP Addressing

**Subnet:** 10.243.0.0/24
- **Gateway:** 10.243.0.254
- **Pi-hole:** 10.243.0.2
- **NAS Server:** 10.243.0.1
- **DHCP Range:** 10.243.0.100-200
- **Static Assignments:** 10.243.0.10-50

### Docker Networks

| Network | Subnet | Purpose |
|---------|--------|---------|
| arr-network | 172.20.0.0/16 | Media management services |
| productivity-net | 172.21.0.0/16 | Productivity tools |
| db-network | 172.22.0.0/16 | Database isolation |
| gluetun-net | 172.23.0.0/16 | VPN-routed traffic |

## Threat Protection

### Defense Layers

1. **Perimeter Defense:**
   - Router firewall
   - Pi-hole (malware domain blocking)
   - VPN for external access only

2. **Network Defense:**
   - Host firewall (UFW)
   - Docker network isolation
   - No default bridge network usage

3. **Application Defense:**
   - Service authentication
   - Rate limiting (reverse proxy)
   - Regular security updates

4. **Data Defense:**
   - Encryption at rest and in transit
   - Regular backups (3-2-1 rule)
   - Automated backup testing

### Intrusion Detection (Planned)

- **Fail2Ban:** Automated IP banning
- **OSSEC:** Host-based IDS
- **Log analysis:** Automated alert on anomalies

## Performance Metrics

### Pi-hole Statistics
- **Queries/Day:** ~500,000
- **Blocked:** ~25-30%
- **Response Time:** <10ms
- **Uptime:** ~90%+

### Network Performance
- **Internal Bandwidth:** 1 Gbps
- **External Bandwidth:** ISP-limited
- **VPN Throughput:** ~300-400 Mbps (Wireguard)

## Management Tools

**Dockge**
- Docker Compose stack management
- Web-based interface
- Features:
  - Visual stack deployment
  - Real-time log viewing
  - Container management
  - Update management
- Replaces manual CLI management

## Future Enhancements

### Planned Additions
1. **Reverse Proxy:** Nginx Proxy Manager or Traefik
2. **SSL Certificates:** Let's Encrypt automation
3. **Monitoring Stack:** Prometheus + Grafana
4. **Centralized Logging:** Loki + Promtail
5. **Intrusion Detection:** Fail2Ban + OSSEC
6. **Network Segmentation:** VLAN separation
7. **Backup Monitoring:** Automated test + alerts

### Security Roadmap
- [ ] Implement reverse proxy with HTTPS
- [ ] Set up comprehensive monitoring
- [ ] Configure automated security updates
- [ ] Implement centralized authentication (Authelia)
- [ ] Regular penetration testing
- [ ] Security audit logging
- [ ] Disaster recovery testing

---

**Security Philosophy:**
- Defense in depth
- Principle of least privilege
- Regular updates and patching
- Encrypted everything
- Monitored and logged

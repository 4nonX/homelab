# Pangolin Tunnel Infrastructure

Self-hosted secure tunnel solution providing external access to homelab services without port forwarding, featuring automatic SSL certificates, DDoS protection, and enterprise-grade security.

## 🌐 Architecture Overview

```
Internet
    ↓
VPS Server (Cloud)
├─ Traefik (Reverse Proxy + Let's Encrypt SSL)
├─ Pangolin (Server API & Management)
├─ Gerbil (Wireguard Gateway)
└─ CrowdSec (IDS/IPS + DDoS Protection)
    ↓
Wireguard Tunnel (Encrypted)
    ↓
Homelab (Behind NAT)
├─ Newt (Client Service)
└─ Local Services
   ├─ Nextcloud
   ├─ Immich
   ├─ SSH Access
   └─ 40+ Docker Services
```

## 🚀 Why Pangolin?

**Traditional Approach Problems:**
- Port forwarding exposes homelab to internet
- Static IP required or DDNS complexity
- No built-in DDoS protection
- Manual SSL certificate management
- Router configuration complexity

**Pangolin Advantages:**
- ✅ No port forwarding needed
- ✅ No static IP required
- ✅ Automatic SSL certificates (Let's Encrypt)
- ✅ Built-in DDoS protection (CrowdSec)
- ✅ Wireguard encryption
- ✅ Web-based management
- ✅ Multiple services on one tunnel

## 🏗️ Infrastructure Components

### VPS Server (Cloud Gateway)

**Provider:** IONOS VPS
**Location:** Berlin, Germany
**Specifications:**
- **CPU:** 2 vCores
- **RAM:** 2 GB
- **Storage:** 80 GB NVMe SSD
- **OS:** Ubuntu 24.04 LTS + Plesk
- **Public IP:** Available (IPv4)

**Deployed Services:**

#### 1. Pangolin Server
- **Purpose:** Central management API
- **Image:** `fosrl/pangolin:1.12.2`
- **Functions:**
  - Client authentication and registration
  - Configuration management
  - Traefik dynamic configuration provider
  - Web dashboard
  - Email notifications (SMTP)

#### 2. Gerbil (Wireguard Gateway)
- **Purpose:** Wireguard tunnel endpoint
- **Image:** `fosrl/gerbil:1.2.2`
- **Functions:**
  - Wireguard VPN server
  - Traffic routing to homelab
  - Key management
  - Port mapping (51820, 21820)
  - Network bridging with Traefik

**Capabilities:**
- `NET_ADMIN` - Network configuration
- `SYS_MODULE` - Kernel module loading (Wireguard)

**Ports Exposed:**
- `51820/udp` - Wireguard tunnel
- `21820/udp` - Alternative Wireguard port
- `443/tcp` - HTTPS traffic
- `80/tcp` - HTTP (redirects to HTTPS)

#### 3. Traefik (Reverse Proxy)
- **Purpose:** SSL termination and routing
- **Image:** `traefik:v3.5`
- **Functions:**
  - Automatic Let's Encrypt SSL certificates
  - HTTP to HTTPS redirection
  - Dynamic routing from Pangolin API
  - Request logging
  - Dashboard

**Key Features:**
- HTTP Challenge for SSL (port 80)
- Certificate storage and renewal
- 30-minute timeouts for long-running requests
- Dynamic configuration via Pangolin API (polls every 5s)
- Insecure backend verification (for internal services)

**Plugins:**
- **Badger** (`fosrl/badger`) - Pangolin-specific middleware

#### 4. CrowdSec (Security)
- **Purpose:** Intrusion detection and prevention
- **Image:** `crowdsecurity/crowdsec:latest`
- **Functions:**
  - Real-time threat detection
  - Automatic IP banning
  - Traefik log analysis
  - Community threat intelligence

**Collections:**
- `crowdsecurity/traefik` - Traefik-specific parsers

### Homelab Client (Behind NAT)

#### Newt Client Service
- **Purpose:** Secure tunnel client
- **Type:** systemd service (not Docker)
- **Binary:** `/DATA/bin/newt`
- **Status:** Active and auto-starting

**Service Configuration:**
- Auto-restart on failure
- Logging to `/DATA/newt.log`
- Starts after network is available
- Runs with system privileges (root)

**Connection:**
- Connects to Pangolin server via HTTPS
- Establishes Wireguard tunnel to Gerbil
- Authenticates with client ID and secret
- Maintains persistent connection

## 🔒 Security Architecture

### Multi-Layer Defense

**Layer 1: DDoS Protection (CrowdSec)**
- Real-time IP reputation analysis
- Automatic banning of malicious IPs
- Community-sourced threat intelligence
- Traefik log monitoring

**Layer 2: SSL/TLS Encryption**
- Let's Encrypt certificates (automatic renewal)
- TLS 1.2+ enforcement
- HTTP to HTTPS redirection
- Certificate storage in persistent volume

**Layer 3: Wireguard Encryption**
- Modern cryptography (ChaCha20, Poly1305)
- Perfect forward secrecy
- Minimal attack surface
- UDP-based for performance

**Layer 4: Authentication**
- Client ID and secret validation
- Email verification (optional)
- Invite-only signup (configurable)
- API secret protection

**Layer 5: Network Isolation**
- No direct homelab exposure
- All traffic through encrypted tunnel
- VPS acts as security boundary
- Local services remain private

### Security Features Enabled

**Pangolin Server:**
- Email verification required
- Invite-only signup
- Organization creation disabled
- Raw resource access allowed (for SSH)
- CORS restrictions

**Traefik:**
- Automatic security headers
- Rate limiting (via middleware)
- Access logging
- Request timeout protection

**CrowdSec:**
- Automatic threat response
- Log analysis and pattern detection
- IP reputation scoring
- Geolocation-based rules (GeoLite2)

## 🔧 Configuration Architecture

### Dynamic Configuration

**Traefik Configuration Sources:**

1. **Static Config** (`traefik_config.yml`):
   - Entry points (HTTP/HTTPS)
   - Certificate resolvers
   - Logging configuration
   - Plugin settings

2. **Dynamic Config** (Pangolin API):
   - Service routing rules
   - Middleware chains
   - TLS configuration
   - Domain mapping
   - Polled every 5 seconds

**Benefits:**
- No Traefik restarts needed
- Configuration via web dashboard
- Instant route updates
- Centralized management

### Service Registration Flow

```
1. Add service in Pangolin dashboard
   ├─ Service name
   ├─ Internal address (homelab)
   ├─ Subdomain
   └─ Port

2. Pangolin generates Traefik config
   └─ Router + Service + Middleware

3. Traefik polls API and updates
   └─ New route active in <5 seconds

4. Let's Encrypt certificate issued
   └─ HTTP-01 challenge via port 80

5. Service accessible via HTTPS
   └─ subdomain.domain.com
```

## 📊 Network Flow

### Inbound Request Flow

```
User Browser
    ↓
DNS Resolution (subdomain.domain.com → VPS IP)
    ↓
Traefik (VPS) - Port 443
    ↓
SSL Termination + CrowdSec Check
    ↓
Route Lookup (Dynamic from Pangolin)
    ↓
Forward to Gerbil
    ↓
Wireguard Tunnel (Encrypted)
    ↓
Newt Client (Homelab)
    ↓
Local Service (Docker Container)
    ↓
Response Path (Reverse)
```

### Tunnel Establishment

```
1. Newt starts on homelab
   └─ Connects to Pangolin API (HTTPS)

2. Newt authenticates
   └─ Client ID + Secret validation

3. Pangolin registers client
   └─ Generates Wireguard config

4. Gerbil creates tunnel endpoint
   └─ Assigns Wireguard IP

5. Newt establishes tunnel
   └─ Persistent Wireguard connection

6. Health checks (ping)
   └─ 10-second intervals

7. Traffic flows through tunnel
   └─ All requests routed via Gerbil
```

## 📈 Performance Characteristics

### Latency
- **VPS Location:** Germany (Berlin)
- **Typical RTT:** 10-30ms (Europe)
- **Wireguard Overhead:** ~1-2ms
- **Traefik Processing:** <5ms
- **Total Added Latency:** ~15-40ms

### Throughput
- **VPS Network:** 1 Gbps
- **Wireguard:** Near line-speed
- **Practical Limit:** ~500-800 Mbps
- **Bottleneck:** Usually homelab uplink

### Scalability
- **Concurrent Connections:** 1000s supported
- **Services per Client:** Unlimited
- **Clients per Server:** 100+ possible
- **Certificate Limit:** Let's Encrypt rate limits apply

## 🔍 Monitoring & Logging

### Server-Side Logging

**Traefik Logs:**
- Location: `./config/traefik/logs/`
- Format: Common log format
- Rotation: 100MB max, 3 backups, 3 days
- Compression: Enabled

**CrowdSec Logs:**
- Analyzed: Traefik access logs
- Decisions: `/var/lib/crowdsec/data/`
- Alerts: Real-time threat detection

**Pangolin Logs:**
- Level: INFO
- Output: Container stdout
- Docker logging: json-file driver

### Client-Side Logging

**Newt Logs:**
- Location: `/DATA/newt.log`
- Output: stdout/stderr appended
- Contents: Connection status, errors, auth events

### Health Checks

**Pangolin:**
- Endpoint: `http://localhost:3001/api/v1/`
- Interval: 10 seconds
- Timeout: 10 seconds
- Retries: 15

**Gerbil:**
- Depends on Pangolin health
- No independent health check

**Traefik:**
- Ping endpoint: `/ping` on HTTP
- Used for container orchestration

## 🛠️ Operational Tasks

### Certificate Management

**Automatic Renewal:**
- Let's Encrypt certificates valid 90 days
- Traefik auto-renews at 30 days remaining
- Storage: `/letsencrypt/acme.json`
- Challenge: HTTP-01 (port 80)

**Manual Certificate Check:**
```bash
# View certificate details
openssl s_client -connect subdomain.domain.com:443 -servername subdomain.domain.com

# Check expiration
echo | openssl s_client -connect subdomain.domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Service Updates

**VPS Services:**
```bash
# Update all services
cd ~/
docker-compose pull
docker-compose up -d

# Update specific service
docker-compose pull pangolin
docker-compose up -d pangolin
```

**Newt Client:**
```bash
# Update binary
wget https://github.com/fosrl/newt/releases/latest/download/newt-linux-amd64 -O /DATA/bin/newt
chmod +x /DATA/bin/newt

# Restart service
systemctl restart newt

# Check status
systemctl status newt
```

### Troubleshooting

**Tunnel Not Connecting:**
```bash
# Check Newt status
systemctl status newt
journalctl -u newt -f

# Check Gerbil logs
docker logs gerbil

# Test Pangolin API
curl https://pangolin.d-net.me/api/v1/
```

**Service Not Accessible:**
```bash
# Check Traefik routing
docker logs traefik | grep subdomain

# Verify certificate
curl -I https://subdomain.domain.com

# Check CrowdSec decisions
docker exec crowdsec cscli decisions list
```

**SSL Certificate Issues:**
```bash
# Check certificate storage
ls -la ~/config/letsencrypt/acme.json

# Force certificate renewal
docker exec traefik traefik healthcheck

# Check Let's Encrypt rate limits
# https://letsencrypt.org/docs/rate-limits/
```

## 💰 Cost Analysis

### VPS Costs
- **IONOS VPS:** ~€5-10/month
- **Alternative Providers:**
  - Hetzner: €4.51/month (similar specs)
  - Linode: $5/month
  - DigitalOcean: $6/month

### Compared to Alternatives

| Solution | Monthly Cost | Setup Complexity | Security |
|----------|--------------|------------------|----------|
| **Pangolin (Self-hosted)** | €5-10 | Medium | High |
| Cloudflare Tunnel | Free* | Low | High |
| Tailscale | Free/€5+ | Low | High |
| Ngrok | $8-20 | Low | Medium |
| VPN + Dynamic DNS | $5 | High | Medium |
| Direct Port Forwarding | $0 | Medium | Low |

*Free tier has limitations

**Pangolin Advantages:**
- Full control and ownership
- No vendor lock-in
- Unlimited bandwidth
- Custom domains
- Learning experience

## 🚀 Deployment Advantages

### For Homelab
- No router configuration needed
- No static IP required
- No port forwarding risks
- Services remain on private network
- Easy to add/remove services
- Professional-grade SSL

### For Portfolio
- Demonstrates advanced networking knowledge
- Shows security best practices
- Self-hosted alternative expertise
- Multi-server infrastructure management
- Docker orchestration skills
- Linux system administration

### For Production Use
- Scalable architecture
- High availability capable
- DDoS protection included
- Monitoring and logging
- Automatic SSL management
- Community support

## 📚 Technical Skills Demonstrated

### Networking
- ✅ Wireguard VPN configuration
- ✅ Reverse proxy architecture
- ✅ DNS and domain management
- ✅ SSL/TLS certificate management
- ✅ Network address translation (NAT) traversal
- ✅ Routing and traffic engineering

### Security
- ✅ Multi-layer defense strategy
- ✅ Intrusion detection/prevention
- ✅ Encryption best practices
- ✅ Authentication and authorization
- ✅ DDoS mitigation
- ✅ Security monitoring and logging

### DevOps
- ✅ Docker containerization
- ✅ Docker Compose orchestration
- ✅ systemd service management
- ✅ Infrastructure as Code
- ✅ Automated certificate management
- ✅ Service monitoring and health checks

### System Administration
- ✅ Linux server management
- ✅ VPS deployment and configuration
- ✅ Log management and rotation
- ✅ Performance optimization
- ✅ Troubleshooting and debugging
- ✅ Backup and disaster recovery

## 🔮 Future Enhancements

### Planned Improvements
- [ ] High availability (multiple VPS nodes)
- [ ] Automatic failover
- [ ] Traffic analytics dashboard
- [ ] Custom middleware development
- [ ] Integration with monitoring stack
- [ ] Automated backup of configurations
- [ ] Multi-region deployment
- [ ] Load balancing across tunnels

### Possible Expansions
- [ ] Mobile VPN access via Wireguard
- [ ] Site-to-site VPN between locations
- [ ] IPv6 support
- [ ] WebSocket optimization
- [ ] Geographic traffic routing
- [ ] Custom authentication providers

---

**Key Takeaways:**
- ✅ Enterprise-grade external access without port forwarding
- ✅ Self-hosted with full control
- ✅ Multi-layer security architecture
- ✅ Automatic SSL certificate management
- ✅ Professional infrastructure at homelab cost
- ✅ Scalable and maintainable solution

**Technologies:** Pangolin · Wireguard · Traefik · CrowdSec · Docker · systemd · Let's Encrypt

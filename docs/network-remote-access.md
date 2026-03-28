# Remote Access Strategy

I use a mix of VPNs and tunnels to get into my lab. The goal is to have a primary way in that's fast and secure, with a few backups in case my home internet or the main tunnel goes down.

---

## Table of Contents

* [Architecture Overview](#architecture-overview)
* [Access Methods Comparison](#access-methods-comparison)
* [Primary - Pangolin VPN](#primary---pangolin-vpn)
* [Fallback - Tailscale](#fallback---tailscale)
* [System Access - ZeroTier](#system-access---zerotier)
* [HTTPS & SSL Automation](#https--ssl-automation)
* [Alternatives Considered](#alternatives-considered)
* [Design Philosophy](#design-philosophy)

---

## Architecture Overview

### Access Layer Stack

```
Internet Users
    â”‚
    â”œâ”€â”€â”€ Primary Path (Pangolin + Traefik)
    â”‚      â”œâ”€ HTTPS (443) â†’ Traefik
    â”‚      â”œâ”€ Auto SSL (Let's Encrypt)
    â”‚      â”œâ”€ CrowdSec Security
    â”‚      â””â”€ WireGuard Tunnel â†’ Home
    â”‚
    â”œâ”€â”€â”€ Fallback Path (Tailscale)
    â”‚      â”œâ”€ Mesh VPN
    â”‚      â”œâ”€ NAT Traversal
    â”‚      â””â”€ Direct P2P â†’ Home
    â”‚
    â””â”€â”€â”€ System Access (ZeroTier/ZimaOS)
           â”œâ”€ Direct IP Assignment
           â”œâ”€ Terminal/SSH Access
           â””â”€ NAS Maintenance â†’ Home
```

### Current Implementation

- **Primary:** [Pangolin](https://github.com/fosrl/pangolin) for exposing web services (Nextcloud, Immich, etc.) over the internet safely.
- **Fallback:** [Tailscale](https://tailscale.com) for a quick way back in from my phone or laptop without opening ports.
- **System Access:** [ZeroTier](https://www.zerotier.com) for direct SSH and maintenance on the NAS itself.

---

### Comparison

| Feature | Pangolin | Tailscale | ZeroTier |
|---------|----------|-----------|----------|
| **Protocol** | WireGuard | WireGuard | Custom |
| **Self-Hosted** | Yes | No | No |
| **Public URLs** | Yes | No | No |
| **Auto SSL** | Yes (Traefik) | No | No |
| **Setup** | High | Low | Medium |

### Why I use each one

- **Pangolin:** This is what I use 90% of the time. It gives me proper subdomains (like `nextcloud.example.com`) with real SSL certificates. It's fully self-hosted on a cheap VPS.
- **Tailscale:** My "oh crap" button. If Pangolin fails, Tailscale usually still works because of their NAT traversal. Great for a quick check from my phone.
- **ZeroTier:** This is mostly for "behind the scenes" work. It's built into ZimaOS, so I use it for SSH and direct system management.

---

## Primary - Pangolin VPN

**Role:** Main production access for web services  
**Repository:** [github.com/fosrl/pangolin](https://github.com/fosrl/pangolin)  
**Documentation:** [docs.pangolin.net](https://docs.pangolin.net/)

### Why Pangolin?

- **Full Sovereignty** - Complete self-hosting, no third-party dependencies
- **Public Subdomains** - Expose services with granular access controls
- **Security Stack** - Traefik + CrowdSec + Let's Encrypt integrated
- **Zero Port Forwarding** - Works behind CGNAT without router config
- **Rich Features** - More configuration options than alternatives
- **WireGuard Foundation** - Modern, performant protocol

### Architecture

```
VPS (IONOS Berlin)
â”œâ”€ Traefik (Reverse Proxy)
â”‚  â”œâ”€ Automatic HTTPS (Let's Encrypt)
â”‚  â”œâ”€ Security Headers
â”‚  â””â”€ Rate Limiting
â”œâ”€ Pangolin API Server
â”‚  â”œâ”€ User Management
â”‚  â”œâ”€ Resource Definitions
â”‚  â””â”€ Access Control
â”œâ”€ Gerbil (WireGuard Gateway)
â”‚  â””â”€ Encrypted Tunnel
â””â”€ CrowdSec (Security)
   â”œâ”€ IDS/IPS
   â”œâ”€ Community Intelligence
   â””â”€ AppSec (WAF)
        â†“
   [WireGuard Tunnel]
        â†“
Home NAS
â””â”€ Newt Client
   â”œâ”€ Tunnel Endpoint
   â””â”€ Resource Exposure
```

### How the pieces fit together

Pangolin isn't just one thing. It's a few different bits working together:

- **Pangolin (Server):** The brain. It handles the users and tells the other parts what to do.
- **Gerbil (Relay):** The WireGuard gateway on the VPS. This is the tunnel exit.
- **Newt (Client):** The part running on my NAS at home. It connects out to Gerbil.
- **Traefik:** The entry point. It handles the SSL certs (via Let's Encrypt) and routes traffic to the right place.
- **CrowdSec:** The bouncer. It watches the logs and blocks IPs that look like they're trying to brute-force or scan the system.

**Component Interaction Flow:**

```
External Request
    â†“
1. Traefik receives HTTPS request
    â†“
2. CrowdSec analyzes for threats â†’ Block if malicious
    â†“
3. Traefik forwards to Pangolin API
    â†“
4. Badger validates authentication
    â†“
5. Pangolin checks access control
    â†“
6. Gerbil routes through WireGuard tunnel
    â†“
7. Newt receives and forwards to local service
    â†“
8. Response flows back through same path
```

### Traefik Security Integration

Pangolin's public subdomain functionality is secured through multiple Traefik middlewares:

#### CrowdSec Integration

**What it does:**  
Real-time threat protection using collaborative intelligence from worldwide CrowdSec network.

**How it works:**

1. **Log Analysis** - Parses Traefik access logs in real-time
2. **Pattern Detection** - Identifies attacks (brute force, SQL injection, XSS)
3. **Community Intelligence** - Leverages global CTI database of known threats
4. **Instant Blocking** - Auto-blocks malicious IPs before they reach services
5. **Streaming Mode** - Efficient updates every 60 seconds with local caching

**Implementation:**

```yaml
# Traefik Plugin Configuration
experimental:
  plugins:
    crowdsec-bouncer-traefik-plugin:
      moduleName: "github.com/maxlerebourg/crowdsec-bouncer-traefik-plugin"
      version: "v1.4.5"

# Middleware
http:
  middlewares:
    crowdsec:
      plugin:
        bouncer:
          enabled: true
          crowdsecMode: stream
          crowdsecLapiHost: crowdsec:8080
          crowdsecLapiKey: ${CROWDSEC_BOUNCER_KEY}
          crowdsecAppsecEnabled: true
          crowdsecAppsecHost: crowdsec:7422
```

**Protection Layers:**

| Layer | Protection | Technology |
|-------|------------|------------|
| **IP Reputation** | Global blocklist of known bad actors | Community CTI |
| **Behavioral Analysis** | Brute force, port scans, credential stuffing | Pattern matching |
| **AppSec (WAF)** | SQL injection, XSS, command injection | Request inspection |
| **Virtual Patching** | CVE exploit protection | Vulnerability database |

**Installed Collections:**

* `crowdsecurity/traefik` - Traefik-specific attack scenarios
* `crowdsecurity/http-cve` - HTTP CVE exploit detection
* `crowdsecurity/appsec-virtual-patching` - Virtual patches for known CVEs
* `crowdsecurity/base-http-scenarios` - Generic HTTP attack patterns

**Remediation Options:**

* **Ban** (HTTP 403) - Block malicious IPs
* **Captcha** - Challenge suspicious traffic (hCaptcha, reCAPTCHA, Turnstile)
* **Temporary Bans** - Time-limited blocks based on threat level

**Benefits:**

- Zero-day protection through community intelligence
- Reduced attack surface before threats reach applications
- No false positives from crowd-validated data
- Open-source with automatic scenario updates
- Dashboard for threat visualization

#### Additional Security Middlewares

**Security Headers:**

* Content Security Policy (CSP)
* Strict Transport Security (HSTS)
* X-Frame-Options (clickjacking prevention)
* X-Content-Type-Options (MIME sniffing prevention)
* Referrer-Policy

**Rate Limiting:**

* Per-IP request throttling
* DoS/DDoS prevention
* Configurable limits per service

**Authentication:**

* ForwardAuth SSO integration
* Session management
* 2FA support (where available)

**Infrastructure:**

* Access logging for audit trails
* Request sanitization
* IP whitelisting for sensitive services

### Why I self-host this

Since I work in sensitive environments (federal background), I'm not comfortable routing my home traffic through a third-party tunnel provider if I can avoid it. Self-hosting means:
- No one else sees my connection metadata.
- I'm not dependent on a company's uptime or pricing changes.
- I control the encryption keys.

### Safety Considerations

**Security Strengths:**

- Complete infrastructure control and visibility
- Multi-layer defense (CrowdSec, Traefik, WireGuard)
- Audit logging for all access
- Custom security hardening
- No third-party trust requirements

**Potential Risks:**

- **Self-Managed Security** - Responsibility for updates and patches
- **VPS Compromise** - Single point protecting home network
- **Configuration Errors** - Complex setup increases misconfiguration risk
- **Availability** - Self-hosted means self-maintained

**Mitigations:**

* Regular automated updates (Watchtower)
* VPS hardening (UFW firewall, SSH key-only, fail2ban)
* Configuration version control and testing
* Monitoring and alerting (uptime checks)
* Regular security audits
* Documented recovery procedures

---

## Fallback - Tailscale

**Role:** Reliable backup for quick access and mobile  
**Website:** [tailscale.com](https://tailscale.com/)

### Why as Fallback?

- **Independent Path** - Works when home network or Pangolin has issues
- **Excellent NAT Traversal** - Functions from restrictive networks
- **Cross-Platform** - Best-in-class mobile and desktop apps
- **Mesh Networking** - Device-to-device without full VPN
- **Strong Security** - End-to-end encryption, coordination servers never see traffic
- **Easy Setup** - 5-minute configuration

### Trust Model

While Tailscale uses coordination servers, it maintains strong security:

* **No Traffic Visibility** - Servers only coordinate connections, never decrypt
* **Open Source Clients** - Auditable security
* **WireGuard Protocol** - Industry-standard encryption
* **Company Reputation** - Strong security track record

**Acceptable as fallback** because its external coordination might still work when Pangolin fails due to home network issues.

### Safety Considerations

**Security Strengths:**

- WireGuard-based end-to-end encryption
- Regular third-party security audits
- Open-source clients (auditable)
- Strong company security practices
- No traffic data stored on coordination servers

**Potential Risks:**

- **Coordination Metadata** - Servers see network topology and connection times
- **Company Access** - Tailscale can see device list and network structure
- **Vendor Dependency** - Recent VC funding raises enshittification concerns
- **Third-Party Trust** - Must trust Tailscale's security and privacy practices

**Mitigations:**

* Use only for non-sensitive, convenience access
* Self-hosted Headscale alternative available if needed
* Regular review of connected devices
* Limited to personal/homelab use (not work data)
* Can be disabled if trust degrades

---

## System Access - ZeroTier

**Role:** Direct NAS system access for maintenance  
**Website:** [zerotier.com](https://www.zerotier.com/)

### Why for System Access?

- **ZimaOS Built-in** - Native integration, zero additional setup
- **Direct IP Assignment** - Real IP address for SSH/terminal access
- **Terminal Access** - Direct SSH to NAS for maintenance
- **Independent Architecture** - Different from both Pangolin and Tailscale
- **Low Maintenance** - Managed through ZimaOS updates
- **Virtual L2 Network** - Behaves like physical switch

### Use Case: NAS Maintenance

Unlike Pangolin (web services) and Tailscale (device mesh), ZeroTier provides direct system-level access:

**What I use it for:**

- SSH access to NAS for system maintenance
- Direct terminal access to ZimaOS CLI
- Docker troubleshooting and container management
- File system operations requiring elevated privileges
- System diagnostics and log analysis
- ZimaOS configuration changes

**Why not Pangolin for this?**

Pangolin excels at exposing web services with authentication, but for direct SSH/terminal access:

* Pangolin requires resource definitions for each service
* ZeroTier provides simpler direct IP connectivity
* Terminal access is more natural over a traditional VPN
* ZimaOS native integration means it's always available

### Unique Features

* **Multicast Support** - Only solution supporting multicast over internet
* **Network Segmentation** - Virtual VLANs and flow rules
* **Custom Protocol** - Not WireGuard, providing architectural diversity
* **Layer 2 Virtualization** - Acts like a virtual ethernet switch

### Safety Considerations

**Security Strengths:**

- Direct P2P connections when possible
- End-to-end encrypted tunnels
- Network-level access control (flow rules)
- Virtual network isolation
- ZimaOS integration and management

**Potential Risks:**

- **Root Server Coordination** - ZeroTier's servers coordinate connections
- **Custom Protocol** - Less audited than WireGuard
- **Wide System Access** - Direct IP grants full network access
- **Metadata Visibility** - ZeroTier sees network membership

**Mitigations:**

* Limited to system administration use only
* Strong SSH key authentication (no passwords)
* Regular updates through ZimaOS
* Network segmentation via flow rules
* Limited device authorization (admin devices only)
* Can self-host controller if needed

---

## HTTPS & SSL Automation

### Let's Encrypt Integration

All public-facing services use automatic HTTPS through Let's Encrypt:

**Traefik Certificate Resolver:**

```yaml
# Static Configuration
certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /letsencrypt/acme.json
      tlsChallenge: {}
```

**Automatic Features:**

- **Auto-Generation** - Certificates created on first request
- **Auto-Renewal** - Renewed 30 days before expiration
- TLS 1.3 - Modern encryption protocols
- HSTS - HTTP Strict Transport Security
- Rate Limiting - Respects Let's Encrypt limits (50 certs/week/domain)

### Certificate Management

| Aspect | Implementation |
|--------|---------------|
| **Challenge Type** | TLS-ALPN-01 (port 443) |
| **Storage** | Persistent volume (`acme.json`) |
| **Backup** | Included in VPS backup strategy |
| **Wildcard Support** | DNS-01 challenge (if needed) |
| **Monitoring** | Certificate expiry alerts |

### HTTPS Enforcement

```yaml
# Global HTTP â†’ HTTPS Redirect
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"
```

**Result:** All traffic automatically upgraded to HTTPS with valid certificates.

### Safety Considerations

**Security Benefits:**

- Automatic certificate management (no human error)
- Industry-standard encryption (TLS 1.3)
- Certificate transparency logging
- Regular renewal (no expired certificates)
- Free, trusted certificates

**Potential Concerns:**

âš ï¸ **Rate Limits** - Can hit Let's Encrypt limits during testing  
âš ï¸ **Challenge Requirements** - Port 443 must be accessible  
âš ï¸ **Domain Validation** - Public proof of domain ownership

**Best Practices:**

* Test with Let's Encrypt staging server first
* Monitor certificate expiry dates
* Backup `acme.json` file regularly
* Use DNS-01 challenge for internal services if needed
* Implement proper logging for certificate operations

---

## Alternatives Considered

### Wiredoor

**Repository:** [github.com/wiredoor/wiredoor](https://github.com/wiredoor/wiredoor)

**Verdict:** âŒ Rejected

**Pros:**

* âœ… Simpler WireGuard management than plain WireGuard
* âœ… Lightweight footprint
* âœ… Fast performance (native WireGuard)
* âœ… Self-hosted with full control

**Cons:**

* âŒ Limited configuration options compared to Pangolin
* âŒ No public subdomain functionality
* âŒ No built-in reverse proxy or SSL management
* âŒ Basic access control only
* âŒ Less feature-rich for web service exposure

**Why Not Chosen:**

Wiredoor would be suitable for simple VPN access but lacks the sophisticated features needed for secure public web service exposure. Pangolin's integrated Traefik + CrowdSec + SSL management provides much more robust solution for the homelab's requirements.

### Cloudflare Tunnel

**Website:** [cloudflare.com/products/tunnel](https://www.cloudflare.com/products/tunnel/)

**Verdict:** âŒ Rejected

**Pros:**

* âœ… Excellent for web services
* âœ… Zero-config SSL
* âœ… Built-in DDoS protection
* âœ… No VPS or server required
* âœ… Free tier very generous
* âœ… Instant setup (5 minutes)

**Cons:**

* âŒ **All traffic routes through Cloudflare** - complete visibility
* âŒ Third-party dependency (conflicts with privacy-first approach)
* âŒ Vendor lock-in risk
* âŒ Cannot meet data sovereignty requirements
* âŒ No control over Cloudflare's infrastructure
* âŒ Terms of Service changes at Cloudflare's discretion

**Why Not Chosen:**

While Cloudflare Tunnel is technically excellent and very convenient, it fundamentally conflicts with the homelab's core principles:

1. **Privacy Concerns:** Every HTTP request is decrypted and re-encrypted by Cloudflare, giving them complete visibility into all traffic
2. **Federal Employment Incompatibility:** Cannot use for work with sensitive information due to third-party data access
3. **Data Sovereignty:** Violates principle of keeping all data under personal control
4. **Philosophy Mismatch:** Defeats the purpose of self-hosting if giving all access to external company

**When It Would Make Sense:**

* Public-facing websites with no sensitive data
* Quick proof-of-concept deployments
* Services where convenience outweighs privacy concerns
* Users without VPS or technical expertise

### Plain WireGuard

**Website:** [wireguard.com](https://www.wireguard.com/)

**Verdict:** âŒ Rejected

**Pros:**

* âœ… Maximum performance
* âœ… Minimal overhead
* âœ… Complete control
* âœ… Battle-tested security
* âœ… Included in Linux kernel

**Cons:**

* âŒ Requires port forwarding (not possible with CGNAT)
* âŒ No NAT traversal
* âŒ Significant manual configuration overhead
* âŒ No built-in management interface
* âŒ Manual peer management
* âŒ No automatic key rotation
* âŒ Complex multi-device setup

**Why Not Chosen:**

While WireGuard is the gold standard for VPN performance and security, the manual management overhead and port forwarding requirement make it impractical for a CGNAT environment. Pangolin uses WireGuard under the hood while solving the NAT/port forwarding problems.

### OpenVPN

**Website:** [openvpn.net](https://openvpn.net/)

**Verdict:** âŒ Rejected

**Pros:**

* âœ… Mature and stable
* âœ… Widely supported across platforms
* âœ… Works over TCP (firewall-friendly)
* âœ… Extensive configuration options

**Cons:**

* âŒ Higher resource overhead than WireGuard
* âŒ Older technology (pre-dates modern crypto)
* âŒ Significantly slower than WireGuard-based solutions
* âŒ More complex configuration
* âŒ Larger attack surface

**Why Not Chosen:**

OpenVPN served well in the past but WireGuard-based solutions (Pangolin, Tailscale) offer better performance, simpler configuration, and modern cryptography. No compelling reason to use older technology for new deployment.

---

## Safety and Philosophy

I follow a "layered" approach. 
1. **Pangolin** is my most trusted path because I built and manage it.
2. **Tailscale** is a pragmatic backup. I trust their encryption, but they still see my network metadata, so it's not my primary.
3. **ZeroTier** is there just for system maintenance.

I don't use things like Cloudflare Tunnel for this lab because they'd have to decrypt my traffic to provide their services, and that goes against my "sovereignty" rule.

### Real-World Usage Patterns

**Typical Access Pattern:**

```
Day-to-Day:
â”œâ”€ 70% Pangolin (primary web services)
â”œâ”€ 20% ZeroTier (SSH/terminal/maintenance)
â”œâ”€ 9% Tailscale (mobile access, quick checks)
â””â”€ 1% Other (testing, troubleshooting)
```

**Use Case Breakdown:**

| Access Type | Solution | Frequency | Examples |
|-------------|----------|-----------|----------|
| **Web Services** | Pangolin | Daily | Nextcloud, Immich, Paperless |
| **System Admin** | ZeroTier | 2-3x/week | SSH, Docker logs, file system |
| **Mobile Quick Access** | Tailscale | As needed | Check services on-the-go |
| **Testing/Dev** | All three | During changes | Verify configurations |

**Uptime Experience:**

* **Pangolin:** ~95%+ (only downtime during planned maintenance)
* **Tailscale:** 100% (always worked when tried)
* **ZeroTier:** ~95%+ (reliable for maintenance access, integrated in ZimaOS)

---

## Related Documentation

* [Pangolin Infrastructure](pangolin-infrastructure.md) - Detailed Pangolin setup
* [Pangolin Deployment Guide](pangolin-deployment-guide.md) - Step-by-step installation
* [Pangolin Configurations](pangolin-configurations.md) - Configuration examples
* [Network Security](network-security.md) - Overall security architecture

---

## Useful Resources

### Pangolin

* [Official Documentation](https://docs.pangolin.net/)
* [GitHub Repository](https://github.com/fosrl/pangolin)
* [Community Discussions](https://github.com/orgs/fosrl/discussions)

### Tailscale

* [Official Documentation](https://tailscale.com/kb/)
* [Open Source Clients](https://github.com/tailscale/tailscale)
* [Headscale (Self-Hosted)](https://github.com/juanfont/headscale)

### ZeroTier

* [Official Documentation](https://docs.zerotier.com/)
* [GitHub Repository](https://github.com/zerotier/ZeroTierOne)
* [Network Controller](https://my.zerotier.com/)

### Security & Automation

* [CrowdSec Documentation](https://docs.crowdsec.net/)
* [Traefik Documentation](https://doc.traefik.io/)
* [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

[â† Back to Main README](README.md)

---

Built with care and coffee.

Powered by Linux, Docker, and WireGuard.

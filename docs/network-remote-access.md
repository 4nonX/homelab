# Remote Access Strategy

Multi-layered VPN architecture ensuring reliable connectivity while maintaining security and privacy.

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
    │
    ├─── Primary Path (Pangolin + Traefik)
    │      ├─ HTTPS (443) → Traefik
    │      ├─ Auto SSL (Let's Encrypt)
    │      ├─ CrowdSec Security
    │      └─ WireGuard Tunnel → Home
    │
    ├─── Fallback Path (Tailscale)
    │      ├─ Mesh VPN
    │      ├─ NAT Traversal
    │      └─ Direct P2P → Home
    │
    └─── System Access (ZeroTier/ZimaOS)
           ├─ Direct IP Assignment
           ├─ Terminal/SSH Access
           └─ NAS Maintenance → Home
```

### Current Implementation

| Layer | Solution | Purpose | Status |
|-------|----------|---------|--------|
| **Primary** | Pangolin VPN (self-hosted) | Web service exposure | ✅ Production |
| **Fallback** | Tailscale | Mobile/quick access | ✅ Active |
| **System Access** | ZeroTier (ZimaOS native) | NAS maintenance/SSH | ✅ Production |

---

## Access Methods Comparison

### Feature Matrix

| Feature | Pangolin | Tailscale | ZeroTier | Wiredoor | Cloudflare Tunnel |
|---------|----------|-----------|----------|----------|-------------------|
| **Protocol** | WireGuard | WireGuard | Custom | WireGuard | Cloudflared |
| **Self-Hosted** | ✅ Full | ⚠️ Headscale only | ⚠️ Partial | ✅ Yes | ❌ No |
| **Public Subdomains** | ✅ Yes | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **WAF/Security** | ✅ CrowdSec + Traefik | ❌ Basic | ❌ Basic | ⚠️ Manual | ✅ Built-in |
| **Auto SSL** | ✅ Let's Encrypt | ❌ No | ❌ No | ❌ No | ✅ Automatic |
| **Reverse Proxy** | ✅ Traefik built-in | ❌ No | ❌ No | ❌ No | ✅ Built-in |
| **Port Forwarding** | ❌ Not needed | ❌ Not needed | ❌ Not needed | ❌ Not needed | ❌ Not needed |
| **NAT Traversal** | ✅ Automatic | ✅ Automatic | ✅ Automatic | ✅ Yes | ✅ Automatic |
| **Mesh Networking** | ⚠️ Site-to-site | ✅ Full mesh | ✅ Full mesh | ⚠️ Limited | ❌ No |
| **Direct IP Access** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **SSH/Terminal** | ⚠️ Via resources | ✅ Direct | ✅ Direct | ✅ Direct | ⚠️ Via tunnel |
| **Access Control** | ✅ Granular | ✅ ACLs | ✅ Flow rules | ⚠️ Basic | ✅ Access policies |
| **Setup Complexity** | 🔴 High | 🟢 Low | 🟡 Medium | 🟡 Medium | 🟢 Low |
| **Free Tier** | ✅ Unlimited | ✅ 100 devices | ⚠️ 10 devices | ✅ Unlimited | ✅ Unlimited |
| **Mobile Apps** | ✅ Newt client | ✅ Excellent | ✅ Good | ⚠️ WG native | ❌ None |
| **SSO Integration** | ✅ Yes | ✅ Yes | ⚠️ Limited | ❌ No | ✅ Yes |
| **Data Sovereignty** | ✅ Complete | ⚠️ Metadata only | ⚠️ Metadata only | ✅ Complete | ❌ Routes via CF |
| **Multicast Support** | ❌ No | ❌ No | ✅ Yes | ❌ No | ❌ No |

### Use Case Fit

| Scenario | Best Choice | Why |
|----------|-------------|-----|
| **Web service exposure** | Pangolin | Public subdomains, SSL, WAF, full control |
| **Quick device access** | Tailscale | Easiest setup, reliable, great mobile |
| **NAS maintenance/SSH** | ZeroTier | Direct IP, terminal access, ZimaOS native |
| **Maximum control** | Pangolin | Full self-hosting, no dependencies |
| **Mobile access** | Tailscale | Best mobile UX, automatic reconnection |
| **Legacy IoT devices** | ZeroTier | Virtual L2, multicast support |
| **Zero-config exposure** | Cloudflare Tunnel | Instant setup, no server needed |
| **Simple VPN** | Wiredoor | Lightweight WireGuard management |

### Performance Comparison

| Metric | Pangolin | Tailscale | ZeroTier | Wiredoor | Cloudflare Tunnel |
|--------|----------|-----------|----------|----------|-------------------|
| **Latency** | ~10-20ms | ~5-15ms | ~10-25ms | ~5-10ms | ~20-40ms |
| **Throughput** | 500-900 Mbps | 600-1000 Mbps | 400-800 Mbps | 700-1000 Mbps | 300-600 Mbps |
| **Connection Time** | 2-4 sec | 1-2 sec | 2-3 sec | 1-2 sec | 3-5 sec |
| **Overhead** | Low (WG) | Low (WG) | Medium (Custom) | Low (WG) | Medium (HTTP/2) |

### Safety Considerations

| Solution | Security Strengths | Safety Concerns | Mitigation |
|----------|-------------------|-----------------|------------|
| **Pangolin** | Full control, CrowdSec IPS, Audit logging | Self-managed security, VPS compromise risk | Regular updates, hardening, monitoring |
| **Tailscale** | Strong encryption, Regular audits, Open source clients | Coordination servers see metadata, Company access to network graph | Use for non-sensitive traffic only |
| **ZeroTier** | Direct P2P connections, Network segmentation | Root servers coordinate, Custom protocol (less audited) | Limit to system access, keep updated |
| **Wiredoor** | Standard WireGuard, Simple attack surface | Minimal features, Limited access control | Not suitable for production web services |
| **Cloudflare** | DDoS protection, Managed security | All traffic via Cloudflare, Cannot comply with data sovereignty, Vendor lock-in | Avoid for sensitive/private data |

---

## Primary - Pangolin VPN

**Role:** Main production access for web services  
**Repository:** [github.com/fosrl/pangolin](https://github.com/fosrl/pangolin)  
**Documentation:** [docs.pangolin.net](https://docs.pangolin.net/)

### Why Pangolin?

✅ **Full Sovereignty** - Complete self-hosting, no third-party dependencies  
✅ **Public Subdomains** - Expose services with granular access controls  
✅ **Security Stack** - Traefik + CrowdSec + Let's Encrypt integrated  
✅ **Zero Port Forwarding** - Works behind CGNAT without router config  
✅ **Rich Features** - More configuration options than alternatives  
✅ **WireGuard Foundation** - Modern, performant protocol

### Architecture

```
VPS (IONOS Berlin)
├─ Traefik (Reverse Proxy)
│  ├─ Automatic HTTPS (Let's Encrypt)
│  ├─ Security Headers
│  └─ Rate Limiting
├─ Pangolin API Server
│  ├─ User Management
│  ├─ Resource Definitions
│  └─ Access Control
├─ Gerbil (WireGuard Gateway)
│  └─ Encrypted Tunnel
└─ CrowdSec (Security)
   ├─ IDS/IPS
   ├─ Community Intelligence
   └─ AppSec (WAF)
        ↓
   [WireGuard Tunnel]
        ↓
Home NAS
└─ Newt Client
   ├─ Tunnel Endpoint
   └─ Resource Exposure
```

### Stack Components

Pangolin operates as a multi-component stack where each piece serves a specific role:

**Pangolin (Server)**  
Core VPN server managing user authentication, access control, and resource definitions. Coordinates the entire tunnel infrastructure and handles client authorization. Acts as the control plane for the entire system.

**Gerbil (Relay)**  
WireGuard gateway that establishes and maintains encrypted tunnels between VPS and home network. Handles NAT traversal and packet routing through the VPN tunnel. Operates as the data plane for all traffic.

**Badger (Middleware)**  
Authentication and session management middleware. Bridges communication between Pangolin server and external services, handling token validation and API requests. Provides the authentication layer between components.

**Traefik (Reverse Proxy)**  
Entry point for all public traffic. Routes HTTPS requests to appropriate services, manages SSL certificates via Let's Encrypt, enforces security headers, and integrates with CrowdSec for threat detection. Serves as the application gateway.

**CrowdSec (Security)**  
Collaborative intrusion prevention system. Analyzes Traefik logs in real-time, identifies malicious behavior, blocks threats using community intelligence, and provides AppSec/WAF protection. Forms the security layer protecting all services.

**Newt (Client)**  
Client-side VPN agent running on home NAS. Establishes WireGuard tunnel to Gerbil relay, exposes local services through Pangolin, and maintains persistent connection with automatic reconnection. Acts as the home-side endpoint.

**Component Interaction Flow:**

```
External Request
    ↓
1. Traefik receives HTTPS request
    ↓
2. CrowdSec analyzes for threats → Block if malicious
    ↓
3. Traefik forwards to Pangolin API
    ↓
4. Badger validates authentication
    ↓
5. Pangolin checks access control
    ↓
6. Gerbil routes through WireGuard tunnel
    ↓
7. Newt receives and forwards to local service
    ↓
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

✅ Zero-day protection through community intelligence  
✅ Reduced attack surface before threats reach applications  
✅ No false positives from crowd-validated data  
✅ Open-source with automatic scenario updates  
✅ Dashboard for threat visualization

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

### Self-Hosted vs. Publicly Hosted

| Aspect | Self-Hosted (My Choice) | Publicly Hosted |
|--------|-------------------------|-----------------|
| **Privacy** | ✅ Complete - no third-party visibility | ❌ Provider sees metadata |
| **Control** | ✅ Full configuration access | ⚠️ Limited to provider options |
| **Dependencies** | ✅ None - fully independent | ❌ Relies on provider uptime |
| **Data Sovereignty** | ✅ All traffic stays in infrastructure | ❌ Routed through provider |
| **Cost** | ✅ VPS only (€5/month) | ⚠️ Subscription fees |
| **Security** | ✅ Custom hardening, full audit | ⚠️ Trust provider security practices |
| **Attack Surface** | ✅ Isolated infrastructure | ❌ Shared with other users |
| **Key Management** | ✅ Complete control | ❌ Provider managed |
| **Compliance** | ✅ Meets privacy requirements | ⚠️ Problematic for sensitive work |
| **Reliability** | ⚠️ High availability feature not available | ✅ High availability, automatic failover if node goes down |
**Why Self-Hosted is Essential:**

Given my federal employment background and potential future work with sensitive information, maintaining complete control over VPN infrastructure isn't just a preference-it's a security necessity. A publicly hosted solution would:

* Introduce external party into trust chain
* Create single point of compromise affecting all connected networks
* Require trusting provider's security practices and incident response
* Potentially expose connection metadata revealing usage patterns
* Add complexity to security auditing and compliance requirements

### Safety Considerations

**Security Strengths:**

✅ Complete infrastructure control and visibility  
✅ Multi-layer defense (CrowdSec, Traefik, WireGuard)  
✅ Audit logging for all access  
✅ Custom security hardening  
✅ No third-party trust requirements

**Potential Risks:**

⚠️ **Self-Managed Security** - Responsibility for updates and patches  
⚠️ **VPS Compromise** - Single point protecting home network  
⚠️ **Configuration Errors** - Complex setup increases misconfiguration risk  
⚠️ **Availability** - Self-hosted means self-maintained

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

✅ **Independent Path** - Works when home network or Pangolin has issues  
✅ **Excellent NAT Traversal** - Functions from restrictive networks  
✅ **Cross-Platform** - Best-in-class mobile and desktop apps  
✅ **Mesh Networking** - Device-to-device without full VPN  
✅ **Strong Security** - End-to-end encryption, coordination servers never see traffic  
✅ **Easy Setup** - 5-minute configuration

### Trust Model

While Tailscale uses coordination servers, it maintains strong security:

* **No Traffic Visibility** - Servers only coordinate connections, never decrypt
* **Open Source Clients** - Auditable security
* **WireGuard Protocol** - Industry-standard encryption
* **Company Reputation** - Strong security track record

**Acceptable as fallback** because its external coordination might still work when Pangolin fails due to home network issues.

### Safety Considerations

**Security Strengths:**

✅ WireGuard-based end-to-end encryption  
✅ Regular third-party security audits  
✅ Open-source clients (auditable)  
✅ Strong company security practices  
✅ No traffic data stored on coordination servers

**Potential Risks:**

⚠️ **Coordination Metadata** - Servers see network topology and connection times  
⚠️ **Company Access** - Tailscale can see device list and network structure  
⚠️ **Vendor Dependency** - Recent VC funding raises enshittification concerns  
⚠️ **Third-Party Trust** - Must trust Tailscale's security and privacy practices

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

✅ **ZimaOS Built-in** - Native integration, zero additional setup  
✅ **Direct IP Assignment** - Real IP address for SSH/terminal access  
✅ **Terminal Access** - Direct SSH to NAS for maintenance  
✅ **Independent Architecture** - Different from both Pangolin and Tailscale  
✅ **Low Maintenance** - Managed through ZimaOS updates  
✅ **Virtual L2 Network** - Behaves like physical switch

### Use Case: NAS Maintenance

Unlike Pangolin (web services) and Tailscale (device mesh), ZeroTier provides direct system-level access:

**What I use it for:**

* 🔧 SSH access to NAS for system maintenance
* 📊 Direct terminal access to ZimaOS CLI
* 🐳 Docker troubleshooting and container management
* 📁 File system operations requiring elevated privileges
* 🔍 System diagnostics and log analysis
* ⚙️ ZimaOS configuration changes

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

✅ Direct P2P connections when possible  
✅ End-to-end encrypted tunnels  
✅ Network-level access control (flow rules)  
✅ Virtual network isolation  
✅ ZimaOS integration and management

**Potential Risks:**

⚠️ **Root Server Coordination** - ZeroTier's servers coordinate connections  
⚠️ **Custom Protocol** - Less audited than WireGuard  
⚠️ **Wide System Access** - Direct IP grants full network access  
⚠️ **Metadata Visibility** - ZeroTier sees network membership

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

* 🔄 **Auto-Generation** - Certificates created on first request
* 🔄 **Auto-Renewal** - Renewed 30 days before expiration
* ✅ **TLS 1.3** - Modern encryption protocols
* ✅ **HSTS** - HTTP Strict Transport Security
* ✅ **Rate Limiting** - Respects Let's Encrypt limits (50 certs/week/domain)

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
# Global HTTP → HTTPS Redirect
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

✅ Automatic certificate management (no human error)  
✅ Industry-standard encryption (TLS 1.3)  
✅ Certificate transparency logging  
✅ Regular renewal (no expired certificates)  
✅ Free, trusted certificates

**Potential Concerns:**

⚠️ **Rate Limits** - Can hit Let's Encrypt limits during testing  
⚠️ **Challenge Requirements** - Port 443 must be accessible  
⚠️ **Domain Validation** - Public proof of domain ownership

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

**Verdict:** ❌ Rejected

**Pros:**

* ✅ Simpler WireGuard management than plain WireGuard
* ✅ Lightweight footprint
* ✅ Fast performance (native WireGuard)
* ✅ Self-hosted with full control

**Cons:**

* ❌ Limited configuration options compared to Pangolin
* ❌ No public subdomain functionality
* ❌ No built-in reverse proxy or SSL management
* ❌ Basic access control only
* ❌ Less feature-rich for web service exposure

**Why Not Chosen:**

Wiredoor would be suitable for simple VPN access but lacks the sophisticated features needed for secure public web service exposure. Pangolin's integrated Traefik + CrowdSec + SSL management provides much more robust solution for the homelab's requirements.

### Cloudflare Tunnel

**Website:** [cloudflare.com/products/tunnel](https://www.cloudflare.com/products/tunnel/)

**Verdict:** ❌ Rejected

**Pros:**

* ✅ Excellent for web services
* ✅ Zero-config SSL
* ✅ Built-in DDoS protection
* ✅ No VPS or server required
* ✅ Free tier very generous
* ✅ Instant setup (5 minutes)

**Cons:**

* ❌ **All traffic routes through Cloudflare** - complete visibility
* ❌ Third-party dependency (conflicts with privacy-first approach)
* ❌ Vendor lock-in risk
* ❌ Cannot meet data sovereignty requirements
* ❌ No control over Cloudflare's infrastructure
* ❌ Terms of Service changes at Cloudflare's discretion

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

**Verdict:** ❌ Rejected

**Pros:**

* ✅ Maximum performance
* ✅ Minimal overhead
* ✅ Complete control
* ✅ Battle-tested security
* ✅ Included in Linux kernel

**Cons:**

* ❌ Requires port forwarding (not possible with CGNAT)
* ❌ No NAT traversal
* ❌ Significant manual configuration overhead
* ❌ No built-in management interface
* ❌ Manual peer management
* ❌ No automatic key rotation
* ❌ Complex multi-device setup

**Why Not Chosen:**

While WireGuard is the gold standard for VPN performance and security, the manual management overhead and port forwarding requirement make it impractical for a CGNAT environment. Pangolin uses WireGuard under the hood while solving the NAT/port forwarding problems.

### OpenVPN

**Website:** [openvpn.net](https://openvpn.net/)

**Verdict:** ❌ Rejected

**Pros:**

* ✅ Mature and stable
* ✅ Widely supported across platforms
* ✅ Works over TCP (firewall-friendly)
* ✅ Extensive configuration options

**Cons:**

* ❌ Higher resource overhead than WireGuard
* ❌ Older technology (pre-dates modern crypto)
* ❌ Significantly slower than WireGuard-based solutions
* ❌ More complex configuration
* ❌ Larger attack surface

**Why Not Chosen:**

OpenVPN served well in the past but WireGuard-based solutions (Pangolin, Tailscale) offer better performance, simpler configuration, and modern cryptography. No compelling reason to use older technology for new deployment.

---

## Design Philosophy

### Security Hierarchy

```
1. 🥇 Most Trusted: Pangolin (Self-Hosted)
   ├─ Full infrastructure control
   ├─ Custom security hardening
   ├─ CrowdSec protection
   └─ Federal employment compatible

2. 🥈 Pragmatic Backup: Tailscale
   ├─ Reliable across network conditions
   ├─ Strong encryption
   ├─ Trusted company
   └─ Different architecture (diversity)

3. 🔧 System Access: ZeroTier (ZimaOS Native)
   ├─ Direct IP for SSH/terminal
   ├─ NAS maintenance and troubleshooting
   ├─ Independent third architecture
   └─ Zero-config built-in option
```

### Redundancy Strategy

The layered approach ensures continuous access while maintaining security:

**Why Multiple Solutions?**

* **Diverse failure modes** - Each uses different architecture
* **Specialized purposes** - Web services, mobile access, system maintenance
* **Network condition resilience** - Tailscale excels where Pangolin might struggle
* **Independent paths** - Failure of one doesn't affect others
* **Security depth** - Multiple verification layers

**Layering Benefits:**

✅ **No single point of failure** - Three independent paths  
✅ **Architectural diversity** - Different protocols/technologies  
✅ **Purpose-built solutions** - Each optimized for specific use case  
✅ **Maintenance flexibility** - Can update one without downtime  
✅ **Skill development** - Experience with multiple modern VPN solutions  
✅ **Future-proof** - Not locked into single vendor/technology

### Critical Security Requirements

Given federal employment considerations and future work with sensitive information:

🔴 **Non-Negotiable:**

* Self-hosted primary access (Pangolin)
* End-to-end encryption on all paths
* Complete infrastructure control
* No third-party traffic routing (on primary)
* Audit trail and logging
* Multi-layer defense in depth

🟡 **Acceptable for Fallback:**

* Coordination servers (Tailscale/ZeroTier) - traffic still encrypted
* External relay (only when direct connection fails)
* Trusted third-party companies with good reputation
* Metadata visibility (connection times, network topology)

🔴 **Unacceptable:**

* Traffic routing through third-party (Cloudflare Tunnel)
* Decryption by external party
* No audit trail
* Vendor-controlled encryption keys

### Real-World Usage Patterns

**Typical Access Pattern:**

```
Day-to-Day:
├─ 70% Pangolin (primary web services)
├─ 20% ZeroTier (SSH/terminal/maintenance)
├─ 9% Tailscale (mobile access, quick checks)
└─ 1% Other (testing, troubleshooting)
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

[← Back to Main README](README.md)

---

**Built with** ❤️ **and** ☕

**Powered by** 🐧 Linux · 🐳 Docker · 🔒 WireGuard


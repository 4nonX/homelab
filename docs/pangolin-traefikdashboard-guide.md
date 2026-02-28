# 🚀 Pangolin Deployment & Observability Guide

**Focus:** Hardened VPS Relay with Real-Time Traffic Analytics & CrowdSec IPS

This guide details the end-to-end deployment of the Pangolin Edge Gateway, featuring the Traefik Log Dashboard and JSON-based Security Analytics.

---

## 🛠️ Step 1: VPS Environment Preparation

Before deploying the stack, the host environment must be prepared for JSON logging and secure handshake protocols.

### 1.1 Directory Structure

```bash
/opt/pangolin/
├── docker-compose.yml
├── config/
│   ├── traefik/
│   │   ├── traefik_config.yml
│   │   └── logs/                 # chmod 755 required
│   └── crowdsec/
│       └── acquis.yaml
```

### 1.2 Security Handshake

The Log Dashboard and Agent require a shared secret. Generate this on the VPS:

```bash
# Store this as $DASHBOARD_AUTH_TOKEN in your secrets
openssl rand -hex 16
```

---

## 📄 Step 2: Integrated Docker Configuration

This configuration implements the Gerbil Service Network pattern, forcing Traefik through the VPN tunnel while maintaining internal bridge discovery.

```yaml
name: pangolin

services:
  # --- Core Gateway ---
  pangolin:
    image: docker.io/fosrl/pangolin:1.12.2
    container_name: pangolin
    restart: unless-stopped
    networks: [pangolin]
    volumes: ["./config:/app/config"]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/v1/"]
      interval: 10s
      timeout: 10s
      retries: 15

  gerbil:
    image: docker.io/fosrl/gerbil:1.2.2
    container_name: gerbil
    restart: unless-stopped
    networks: [pangolin]
    depends_on: { pangolin: { condition: service_healthy } }
    cap_add: [NET_ADMIN, SYS_MODULE]
    ports: ["443:443", "80:80", "51820:51820/udp"]
    command:
      - --reachableAt=http://gerbil:3004
      - --remoteConfig=http://pangolin:3001/api/v1/

  traefik:
    image: docker.io/traefik:v3.5
    container_name: traefik
    network_mode: service:gerbil
    command:
      - --configFile=/etc/traefik/traefik_config.yml
      - --providers.docker.network=pangolin
    volumes:
      - ./config/traefik:/etc/traefik:ro
      - ./config/letsencrypt:/letsencrypt
      - ./config/traefik/logs:/var/log/traefik

  # --- Observability Stack ---
  traefik-log-dashboard-agent:
    image: hhftechnology/traefik-log-dashboard-agent:latest
    container_name: traefik-log-dashboard-agent
    environment:
      - TRAEFIK_LOG_DASHBOARD_ACCESS_PATH=/logs/access.log
      - TRAEFIK_LOG_DASHBOARD_AUTH_TOKEN=<DASHBOARD_AUTH_TOKEN>
    volumes: ["./config/traefik/logs:/logs:ro"]
    networks: [pangolin]

  traefik-log-dashboard:
    image: hhftechnology/traefik-log-dashboard:latest
    container_name: traefik-log-dashboard
    environment:
      - AGENT_API_URL=http://traefik-log-dashboard-agent:5000
      - AGENT_API_TOKEN=<DASHBOARD_AUTH_TOKEN>
    networks: [pangolin]

  # --- Security Layer ---
  crowdsec:
    image: crowdsecurity/crowdsec:latest
    container_name: crowdsec
    networks: [pangolin]
    volumes:
      - ./config/crowdsec/data:/var/lib/crowdsec/data
      - ./config/crowdsec/config:/etc/crowdsec
      - ./config/traefik/logs:/var/log/traefik:ro
    environment:
      COLLECTIONS: "crowdsecurity/traefik"

networks:
  pangolin:
    name: pangolin
    driver: bridge
```

---

## 🔧 Step 3: Critical Configuration Edits

To bridge the gap between "standard" Traefik and this specialized stack, three manual edits were performed.

### 3.1 Traefik Static Config (`traefik_config.yml`)

Switched to JSON formatting to enable dashboard parsing.

```yaml
accessLog:
  filePath: "/var/log/traefik/access.log"
  format: json  # Required for dashboard agent
  fields:
    headers:
      defaultMode: keep
```

### 3.2 CrowdSec Acquisition (`acquis.yaml`)

Instructed the CrowdSec parser to treat the Traefik log as a JSON stream.

```yaml
filenames:
  - /var/log/traefik/access.log
labels:
  type: traefik
```

---

## 🌐 Step 4: Pangolin Dashboard Integration

To bypass "Bad Gateway" (502) issues common in Gerbil network-mode setups, the UI is configured as a Resource.

| Setting | Value |
|---------|-------|
| Resource Type | Web Resource |
| Hostname | `traefik-log-dashboard` |
| Port | `3000` |
| Secure Access | Enabled (Platform SSO) |

---

## 📝 Post-Deployment Maintenance

### Permissions
```bash
sudo chmod -R 755 ./config/traefik/logs
```
Allow the agent to read JSON logs.

### Verification
Check agent handshake:
```bash
docker logs traefik-log-dashboard | grep "Connected"
```

### GeoIP Enhancement
Mount `GeoLite2-City.mmdb` to the agent to enable the world map visualization.

---

## 🔍 Troubleshooting

### Common Issues

**Issue:** Dashboard shows "No data available"
- **Solution:** Verify JSON format in `traefik_config.yml` and restart Traefik
- **Check:** `docker logs traefik-log-dashboard-agent` for parsing errors

**Issue:** CrowdSec not detecting attacks
- **Solution:** Confirm `acquis.yaml` points to correct log path
- **Check:** `docker exec crowdsec cscli metrics` for ingestion stats

**Issue:** 502 Bad Gateway on dashboard access
- **Solution:** Ensure Resource configuration uses hostname `traefik-log-dashboard` (not IP)
- **Check:** Network connectivity with `docker exec pangolin ping traefik-log-dashboard`

---

## 📚 Additional Resources

- [Pangolin Documentation](https://pangolin.com/docs)
- [Traefik Access Logs](https://doc.traefik.io/traefik/observability/access-logs/)
- [CrowdSec Collections](https://hub.crowdsec.net/)
- [Traefik Log Dashboard](https://github.com/hhftechnology/traefik-log-dashboard)

---

**Last Updated:** January 2026  
**Maintained by:** Dan  
**License:** MIT

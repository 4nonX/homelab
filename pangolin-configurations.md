# Pangolin Configuration Files (Sanitized)

Configuration files with sensitive data redacted for portfolio/documentation purposes.

## 📁 VPS Server Configuration

### docker-compose.yml

```yaml
name: pangolin
services:
  pangolin:
    image: docker.io/fosrl/pangolin:1.12.2
    container_name: pangolin
    restart: unless-stopped
    volumes:
      - ./config:/app/config
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/v1/"]
      interval: "10s"
      timeout: "10s"
      retries: 15

  gerbil:
    image: docker.io/fosrl/gerbil:1.2.2
    container_name: gerbil
    restart: unless-stopped
    depends_on:
      pangolin:
        condition: service_healthy
    command:
      - --reachableAt=http://gerbil:3004
      - --generateAndSaveKeyTo=/var/config/key
      - --remoteConfig=http://pangolin:3001/api/v1/
    volumes:
      - ./config/:/var/config
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    ports:
      - 51820:51820/udp
      - 21820:21820/udp
      - 443:443
      - 80:80

  traefik:
    image: docker.io/traefik:v3.5
    container_name: traefik
    restart: unless-stopped
    network_mode: service:gerbil
    depends_on:
      pangolin:
        condition: service_healthy
    command:
      - --configFile=/etc/traefik/traefik_config.yml
    volumes:
      - ./config/traefik:/etc/traefik:ro
      - ./config/letsencrypt:/letsencrypt
      - ./config/traefik/logs:/var/log/traefik

  crowdsec:
    image: crowdsecurity/crowdsec:latest
    container_name: crowdsec
    restart: unless-stopped
    depends_on:
      - traefik
    volumes:
      - ./config/crowdsec/data:/var/lib/crowdsec/data
      - ./config/crowdsec/config:/etc/crowdsec
      - ./config/traefik/logs:/var/log/traefik:ro
    environment:
      COLLECTIONS: "crowdsecurity/traefik"

networks:
  default:
    driver: bridge
    name: pangolin
```

### config/config.yml

```yaml
# Pangolin Server Configuration
# Documentation: https://docs.pangolin.net/

gerbil:
    start_port: 51820
    base_endpoint: "pangolin.example.com"

app:
    dashboard_url: "https://pangolin.example.com"
    log_level: "info"
    telemetry:
        anonymous_usage: true

domains:
    domain1:
        base_domain: "example.com"

server:
    secret: "<SERVER_SECRET>"
    cors:
        origins: ["https://pangolin.example.com"]
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
        allowed_headers: ["X-CSRF-Token", "Content-Type"]
        credentials: false
    maxmind_db_path: "./config/GeoLite2-Country.mmdb"

email:
    smtp_host: "smtp.example.com"
    smtp_port: 587
    smtp_user: "noreply@example.com"
    smtp_pass: "<SMTP_PASSWORD>"
    no_reply: "noreply@example.com"

flags:
    require_email_verification: true
    disable_signup_without_invite: true
    disable_user_create_org: false
    allow_raw_resources: true
```

### config/traefik/traefik_config.yml

```yaml
api:
  insecure: true
  dashboard: true

providers:
  http:
    endpoint: "http://pangolin:3001/api/v1/traefik-config"
    pollInterval: "5s"
  file:
    filename: "/etc/traefik/dynamic_config.yml"

experimental:
  plugins:
    badger:
      moduleName: "github.com/fosrl/badger"
      version: "v1.2.1"

log:
  level: "INFO"
  format: "common"
  maxSize: 100
  maxBackups: 3
  maxAge: 3
  compress: true

certificatesResolvers:
  letsencrypt:
    acme:
      httpChallenge:
        entryPoint: web
      email: "admin@example.com"
      storage: "/letsencrypt/acme.json"
      caServer: "https://acme-v02.api.letsencrypt.org/directory"

entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"
    transport:
      respondingTimeouts:
        readTimeout: "30m"
    http:
      tls:
        certResolver: "letsencrypt"

serversTransport:
  insecureSkipVerify: true

ping:
  entryPoint: "web"
```

## 📁 Homelab Client Configuration

### /etc/systemd/system/newt.service

```ini
[Unit]
Description=Newt Pangolin VPN Client
After=network.target

[Service]
Type=simple
ExecStart=/DATA/bin/newt --id <CLIENT_ID> --secret <CLIENT_SECRET> --endpoint https://pangolin.example.com
Restart=always
StandardOutput=append:/DATA/newt.log
StandardError=append:/DATA/newt.log

[Install]
WantedBy=multi-user.target
```

### Newt Installation Script

```bash
#!/bin/bash
# Install Newt client on homelab

# Download latest Newt binary
wget https://github.com/fosrl/newt/releases/latest/download/newt-linux-amd64 \
  -O /DATA/bin/newt

# Make executable
chmod +x /DATA/bin/newt

# Create log file
touch /DATA/newt.log
chown root:root /DATA/newt.log

# Create systemd service
cat > /etc/systemd/system/newt.service <<EOF
[Unit]
Description=Newt Pangolin VPN Client
After=network.target

[Service]
Type=simple
ExecStart=/DATA/bin/newt --id <CLIENT_ID> --secret <CLIENT_SECRET> --endpoint https://pangolin.example.com
Restart=always
StandardOutput=append:/DATA/newt.log
StandardError=append:/DATA/newt.log

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable newt.service
systemctl start newt.service

# Check status
systemctl status newt.service
```

## 📝 Configuration Notes

### Security Considerations

**Secrets Management:**
- `<SERVER_SECRET>`: 32-character random string for API authentication
- `<CLIENT_ID>`: Unique identifier generated by Pangolin
- `<CLIENT_SECRET>`: Client authentication token from Pangolin dashboard
- `<SMTP_PASSWORD>`: Email server authentication

**Generation:**
```bash
# Generate random secret (32 chars)
openssl rand -base64 24

# Or using /dev/urandom
tr -dc A-Za-z0-9 </dev/urandom | head -c 32
```

### Domain Configuration

**DNS Records Required:**
```
Type  Name                Target          TTL
A     pangolin           <VPS_IP>        3600
A     *.example.com      <VPS_IP>        3600
```

**Subdomain Examples:**
- `pangolin.example.com` - Pangolin dashboard
- `nextcloud.example.com` - Nextcloud service
- `photos.example.com` - Immich photos
- `ssh.example.com` - SSH access (TCP over HTTP)

### Port Requirements

**VPS Firewall Rules:**
```bash
# Allow HTTP (Let's Encrypt)
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Allow Wireguard
ufw allow 51820/udp
ufw allow 21820/udp

# Enable firewall
ufw enable
```

**No Homelab Port Forwarding Required!**

### Email Configuration

**Supported SMTP Providers:**
- Gmail (smtp.gmail.com:587) - Requires app password
- SendGrid (smtp.sendgrid.net:587)
- Mailgun (smtp.mailgun.org:587)
- Custom SMTP server

**Email Uses:**
- User registration verification
- Password reset
- Service notifications
- Security alerts

### CrowdSec Configuration

**Data Directories:**
```
./config/crowdsec/
├── data/           # Database and decisions
├── config/         # CrowdSec configuration
└── scenarios/      # Custom detection scenarios
```

**Collection Installed:**
- `crowdsecurity/traefik` - Traefik-specific parsers

**Useful Commands:**
```bash
# List banned IPs
docker exec crowdsec cscli decisions list

# Unban IP
docker exec crowdsec cscli decisions delete -i <IP_ADDRESS>

# Check metrics
docker exec crowdsec cscli metrics

# Update hub
docker exec crowdsec cscli hub update
```

## 🔄 Update Procedures

### VPS Server Update

```bash
# Backup configurations
cd ~
tar -czf pangolin-backup-$(date +%Y%m%d).tar.gz config/

# Pull latest images
docker-compose pull

# Recreate containers
docker-compose up -d

# Verify health
docker ps
docker logs -f pangolin
docker logs -f gerbil
docker logs -f traefik
```

### Newt Client Update

```bash
# Stop service
systemctl stop newt

# Backup current binary
cp /DATA/bin/newt /DATA/bin/newt.backup

# Download latest
wget https://github.com/fosrl/newt/releases/latest/download/newt-linux-amd64 \
  -O /DATA/bin/newt

# Make executable
chmod +x /DATA/bin/newt

# Restart service
systemctl start newt

# Verify
systemctl status newt
tail -f /DATA/newt.log
```

## 🐛 Troubleshooting

### Common Issues

**Tunnel Not Connecting:**
```bash
# Check Newt logs
tail -f /DATA/newt.log

# Check endpoint accessibility
curl https://pangolin.example.com/api/v1/

# Verify client credentials
journalctl -u newt -n 50
```

**Certificate Issues:**
```bash
# Check certificate file
ls -la ~/config/letsencrypt/acme.json

# Verify permissions (must be 600)
chmod 600 ~/config/letsencrypt/acme.json

# Test certificate
openssl s_client -connect pangolin.example.com:443
```

**Service Not Accessible:**
```bash
# Check Traefik routing
docker logs traefik | grep "service-name"

# Verify DNS
nslookup subdomain.example.com

# Check CrowdSec blocks
docker exec crowdsec cscli decisions list | grep <YOUR_IP>
```

---

**Important:** Replace all placeholder values (`<>`) with actual configuration before deployment.

**Documentation:** https://docs.pangolin.net/
**GitHub:** https://github.com/fosrl/pangolin
**Community:** https://discord.gg/pangolin

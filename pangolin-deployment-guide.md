# Pangolin Deployment Guide

Complete step-by-step guide for deploying a self-hosted Pangolin tunnel infrastructure from scratch.

## 📋 Prerequisites

### Required Resources
- **VPS Server:** 2 vCPU, 2GB RAM, 20GB+ storage
- **Domain Name:** example.com (with DNS control)
- **Homelab Server:** Any Linux system with Docker or systemd
- **Email Account:** SMTP access for notifications

### Required Knowledge
- Linux command line proficiency
- Basic Docker understanding
- DNS record management
- SSH access and key management

## 🎯 Architecture Goals

```
Goal: Secure external access to homelab services
├─ No port forwarding
├─ Automatic SSL certificates
├─ DDoS protection
├─ Encrypted tunnel
└─ Easy service management
```

## 📝 Deployment Steps

### Phase 1: VPS Setup

#### Step 1.1: Provision VPS

**Recommended Providers:**
- **IONOS** (€5/mo) - Used in this deployment
- **Hetzner** (€4.51/mo) - Excellent performance
- **Linode** ($5/mo) - Easy to use
- **DigitalOcean** ($6/mo) - Great docs

**Specifications:**
- OS: Ubuntu 24.04 LTS
- CPU: 2 vCores minimum
- RAM: 2GB minimum
- Storage: 20GB+ (NVMe preferred)
- Location: Choose closest to users

#### Step 1.2: Initial Server Configuration

```bash
# SSH into VPS
ssh root@<VPS_IP>

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y \
    curl \
    wget \
    git \
    ufw \
    ca-certificates \
    gnupg

# Install Docker
curl -fsSL https://get.docker.com | bash

# Install Docker Compose
apt install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

#### Step 1.3: Configure Firewall

```bash
# Enable UFW
ufw allow 22/tcp          # SSH
ufw allow 80/tcp          # HTTP (Let's Encrypt)
ufw allow 443/tcp         # HTTPS
ufw allow 51820/udp       # Wireguard
ufw allow 21820/udp       # Wireguard alt

# Enable firewall
ufw --force enable

# Verify rules
ufw status numbered
```

#### Step 1.4: Create Project Directory

```bash
# Create directory structure
mkdir -p ~/pangolin/{config,logs,backups}
cd ~/pangolin

# Create config subdirectories
mkdir -p config/{traefik,crowdsec,letsencrypt}
mkdir -p config/traefik/logs
mkdir -p config/crowdsec/{data,config}
```

### Phase 2: DNS Configuration

#### Step 2.1: Configure DNS Records

**Add the following DNS records:**

```
Type    Name        Target          TTL     Priority
A       pangolin    <VPS_IP>        3600    -
A       *           <VPS_IP>        3600    -
```

**Explanation:**
- `pangolin.example.com` - Pangolin dashboard
- `*.example.com` - Wildcard for all services

**Verification:**
```bash
# Wait for DNS propagation (can take 5-60 minutes)
dig pangolin.example.com
dig test.example.com

# Both should resolve to VPS_IP
```

### Phase 3: Pangolin Server Deployment

#### Step 3.1: Create Docker Compose File

```bash
cd ~/pangolin

cat > docker-compose.yml <<'EOF'
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
EOF
```

#### Step 3.2: Create Pangolin Configuration

```bash
# Generate server secret
SERVER_SECRET=$(openssl rand -base64 24)

cat > config/config.yml <<EOF
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
    secret: "${SERVER_SECRET}"
    cors:
        origins: ["https://pangolin.example.com"]
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
        allowed_headers: ["X-CSRF-Token", "Content-Type"]
        credentials: false

email:
    smtp_host: "smtp.example.com"
    smtp_port: 587
    smtp_user: "noreply@example.com"
    smtp_pass: "your-smtp-password"
    no_reply: "noreply@example.com"

flags:
    require_email_verification: true
    disable_signup_without_invite: true
    disable_user_create_org: false
    allow_raw_resources: true
EOF

echo "Generated server secret: ${SERVER_SECRET}"
echo "Save this secret securely!"
```

#### Step 3.3: Create Traefik Configuration

```bash
cat > config/traefik/traefik_config.yml <<'EOF'
api:
  insecure: true
  dashboard: true

providers:
  http:
    endpoint: "http://pangolin:3001/api/v1/traefik-config"
    pollInterval: "5s"

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
EOF
```

#### Step 3.4: Set Permissions

```bash
# Set correct permissions for Let's Encrypt storage
touch config/letsencrypt/acme.json
chmod 600 config/letsencrypt/acme.json

# Set log directory permissions
chmod 755 config/traefik/logs
```

#### Step 3.5: Deploy Stack

```bash
# Pull images
docker compose pull

# Start services
docker compose up -d

# Verify containers
docker ps

# Check logs
docker logs pangolin
docker logs gerbil
docker logs traefik
docker logs crowdsec

# Wait for Pangolin to be healthy (can take 30-60 seconds)
docker inspect pangolin | grep -A 5 Health
```

#### Step 3.6: Access Dashboard

```bash
# Get initial admin credentials
docker logs pangolin | grep -i "admin" | grep -i "password"

# Access dashboard
# https://pangolin.example.com

# Login with admin credentials
# Change password immediately!
```

### Phase 4: Homelab Client Setup

#### Step 4.1: Create Client in Dashboard

1. Login to https://pangolin.example.com
2. Navigate to "Clients" or "Devices"
3. Click "Add Client" or "New Device"
4. Name: `homelab-nas` (or similar)
5. Save and note the **Client ID** and **Client Secret**

#### Step 4.2: Install Newt on Homelab

```bash
# SSH into homelab server
ssh user@homelab-server

# Download Newt binary
sudo wget https://github.com/fosrl/newt/releases/latest/download/newt-linux-amd64 \
  -O /usr/local/bin/newt

# Make executable
sudo chmod +x /usr/local/bin/newt

# Verify installation
/usr/local/bin/newt --version
```

#### Step 4.3: Create Systemd Service

```bash
# Replace with your actual Client ID and Secret from dashboard
CLIENT_ID="your-client-id"
CLIENT_SECRET="your-client-secret"
ENDPOINT="https://pangolin.example.com"

sudo cat > /etc/systemd/system/newt.service <<EOF
[Unit]
Description=Newt Pangolin VPN Client
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/newt --id ${CLIENT_ID} --secret ${CLIENT_SECRET} --endpoint ${ENDPOINT}
Restart=always
StandardOutput=append:/var/log/newt.log
StandardError=append:/var/log/newt.log

[Install]
WantedBy=multi-user.target
EOF

# Create log file
sudo touch /var/log/newt.log

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable newt.service
sudo systemctl start newt.service

# Check status
sudo systemctl status newt.service

# Watch logs
sudo tail -f /var/log/newt.log
```

#### Step 4.4: Verify Tunnel Connection

```bash
# Check Newt logs
sudo journalctl -u newt -f

# On VPS, check Gerbil logs
docker logs gerbil | grep "client"

# Verify in Pangolin dashboard
# Client should show as "Connected" with green status
```

### Phase 5: Service Configuration

#### Step 5.1: Add First Service

**In Pangolin Dashboard:**

1. Navigate to "Resources" or "Services"
2. Click "Add Resource"
3. Configure service:
   - **Name:** `nextcloud`
   - **Type:** `HTTP`
   - **Target:** `http://192.168.1.100:10081`
   - **Subdomain:** `nextcloud`
   - **Enable SSL:** Yes
4. Save configuration

**Configuration Explanation:**
- `Target` = Internal homelab service address
- `Subdomain` = Creates `nextcloud.example.com`
- Traefik will automatically get SSL certificate

#### Step 5.2: Test Service Access

```bash
# Wait 5-10 seconds for configuration to propagate

# Test from external network
curl -I https://nextcloud.example.com

# Should return:
# HTTP/2 200
# SSL certificate should be valid
```

#### Step 5.3: Add More Services

**Repeat for each service:**

```
Service         Internal Address        Subdomain
Immich          http://10.243.0.1:2283  photos
Vaultwarden     http://10.243.0.1:10330 vault
Paperless-NGX   http://10.243.0.1:8000  docs
```

**SSH Access (TCP Service):**
- **Type:** `TCP` (Raw Resource)
- **Target:** `192.168.1.100:22`
- **Subdomain:** `ssh`
- **Protocol:** TCP over HTTP tunnel

### Phase 6: Security Hardening

#### Step 6.1: Configure CrowdSec

```bash
# SSH into VPS
ssh root@<VPS_IP>

cd ~/pangolin

# Check CrowdSec status
docker exec crowdsec cscli metrics

# Install additional collections
docker exec crowdsec cscli collections install crowdsecurity/linux
docker exec crowdsec cscli collections install crowdsecurity/http-cve

# Enable automatic ban
docker exec crowdsec cscli decisions add --ip 1.2.3.4 --duration 24h --reason "Test ban"
docker exec crowdsec cscli decisions list

# Remove test ban
docker exec crowdsec cscli decisions delete --ip 1.2.3.4
```

#### Step 6.2: Configure Fail2Ban (Optional)

```bash
# Install Fail2Ban for additional SSH protection
apt install -y fail2ban

# Configure SSH protection
cat > /etc/fail2ban/jail.local <<EOF
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

systemctl restart fail2ban
systemctl status fail2ban
```

#### Step 6.3: Secure SSH Access

```bash
# Generate SSH key on local machine (if not exists)
ssh-keygen -t ed25519 -C "your@email.com"

# Copy public key to VPS
ssh-copy-id root@<VPS_IP>

# Test key-based login
ssh root@<VPS_IP>

# Disable password authentication
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Restart SSH
systemctl restart sshd
```

### Phase 7: Monitoring & Maintenance

#### Step 7.1: Set Up Log Rotation

```bash
cat > /etc/logrotate.d/pangolin <<'EOF'
/root/pangolin/config/traefik/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF
```

#### Step 7.2: Create Backup Script

```bash
cat > ~/backup-pangolin.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="pangolin-backup-${DATE}.tar.gz"

mkdir -p ${BACKUP_DIR}

cd /root/pangolin
tar -czf ${BACKUP_DIR}/${BACKUP_FILE} \
    config/ \
    docker-compose.yml

# Keep only last 7 backups
cd ${BACKUP_DIR}
ls -t pangolin-backup-*.tar.gz | tail -n +8 | xargs -r rm

echo "Backup completed: ${BACKUP_FILE}"
EOF

chmod +x ~/backup-pangolin.sh

# Add to crontab (daily at 3 AM)
(crontab -l 2>/dev/null; echo "0 3 * * * /root/backup-pangolin.sh") | crontab -
```

#### Step 7.3: Create Update Script

```bash
cat > ~/update-pangolin.sh <<'EOF'
#!/bin/bash
echo "Backing up current configuration..."
/root/backup-pangolin.sh

cd /root/pangolin

echo "Pulling latest images..."
docker compose pull

echo "Recreating containers..."
docker compose up -d

echo "Verifying health..."
sleep 10
docker ps
docker compose ps

echo "Update completed!"
EOF

chmod +x ~/update-pangolin.sh
```

## ✅ Post-Deployment Checklist

### Verification Steps

- [ ] VPS firewall configured and active
- [ ] DNS records resolving correctly
- [ ] Pangolin dashboard accessible (HTTPS with valid cert)
- [ ] Newt client connected and showing as online
- [ ] At least one test service accessible externally
- [ ] SSL certificates valid and auto-renewing
- [ ] CrowdSec active and monitoring
- [ ] Logs rotating properly
- [ ] Backups scheduled and tested
- [ ] SSH key-based authentication working
- [ ] Password authentication disabled

### Security Review

- [ ] Strong passwords for all services
- [ ] Server secret stored securely
- [ ] Client secrets not committed to git
- [ ] Email verification enabled
- [ ] Signup limited to invites
- [ ] SSH hardened (keys only, no root password)
- [ ] Firewall rules minimal and necessary
- [ ] CrowdSec monitoring active
- [ ] Log monitoring configured

### Performance Baseline

```bash
# Check resource usage
docker stats

# Check tunnel latency
ping -c 10 pangolin.example.com

# Test service response time
time curl -I https://nextcloud.example.com

# Monitor logs
docker logs -f traefik --tail 100
```

## 🎯 Success Criteria

Your deployment is successful when:

1. ✅ Services accessible from internet via HTTPS
2. ✅ No port forwarding on home router
3. ✅ Valid SSL certificates auto-renewing
4. ✅ Tunnel stable for 24+ hours
5. ✅ CrowdSec blocking suspicious IPs
6. ✅ Logs clean without errors
7. ✅ Backup and restore tested

## 🔧 Troubleshooting

See `pangolin-configurations.md` for detailed troubleshooting procedures.

---

**Congratulations!** You now have a production-ready, self-hosted tunnel infrastructure!

**Next Steps:**
- Add remaining services
- Configure monitoring and alerting
- Test failover and disaster recovery
- Document your specific configuration
- Share knowledge with the community

**Estimated Deployment Time:** 2-3 hours (including DNS propagation)

**Difficulty:** Intermediate (Linux, Docker, networking knowledge required)

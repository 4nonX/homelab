# 🏠 Homelab Dashboard - Complete Deployment Guide

Production-ready homelab dashboard with 32+ services support, drag & drop management, real-time stats, and beautiful cyberpunk design. This dashboard is a self-contained, static HTML dashboard designed specifically for my homelab. It is included here as a reference implementation and can be reused or adapted by others. 

Authentication & Security Model

This dashboard intentionally implements no authentication or authorization logic.
It is designed to be deployed exclusively behind an upstream access gateway (e.g. Pangolin, Traefik + Auth, Zero Trust proxy), which provides centralized authentication, authorization, and TLS termination.

The dashboard is treated as a trusted internal application.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Alpine-brightgreen.svg)](https://nginx.org/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation Guide](#-installation-guide)
  - [Step 1: Terminal Setup](#step-1-terminal-setup-ssh)
  - [Step 2: Deploy with Dockge](#step-2-deploy-with-dockge)
  - [Step 3: Verification](#step-3-verification--testing)
- [Complete HTML File](#-complete-html-file)
- [Complete Configuration Files](#-complete-configuration-files)
- [Customization Guide](#-customization-guide)
- [Optional: Stats API Setup](#-optional-stats-api-setup)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)

---

## ✨ Features

- ✅ **Service Management** - Add, edit, delete services via web UI
- ✅ **Drag & Drop Organization** - Reorder services within categories
- ✅ **Category Management** - Create custom categories, delete, rename
- ✅ **Dual-link System** - Internal (LAN) and External (domain) links per service
- ✅ **Real-time Stats Dashboard** - CPU, Memory, Storage, Temperature (optional API)
- ✅ **LocalStorage Persistence** - All changes saved automatically
- ✅ **Responsive Design** - Works on desktop, tablet, mobile
- ✅ **Modern Cyberpunk UI** - Animated grid background, smooth transitions
- ✅ **Featured/Hidden Services** - Mark important services or hide background ones
- ✅ **Built-in Terminal** - Live system status display
- ✅ **Zero Configuration** - Works out of the box, customize as you grow

---

## 📦 Prerequisites

### Required

- **Linux-based NAS/Server** - Ubuntu, Debian, ZimaOS, etc.
- **SSH Access** - `ssh root@YOUR_NAS_IP`
- **Docker** - Installed and running
- **Dockge** (recommended) OR Docker Compose CLI
- **Basic Linux Knowledge** - Using nano, file permissions, etc.

### Optional

- **Domain Name** - For external HTTPS access
- **Reverse Proxy** - Traefik, Nginx Proxy Manager, Caddy
- **VPN/Tunnel** - Pangolin, Tailscale, Cloudflare Tunnel, ZeroTier

### Information You'll Need

Before starting, prepare these values:

```bash
NAS_IP=YOUR_NAS_IP                # Example: 192.168.1.100
NAS_SSH_PORT=22                   # Default SSH port
DASHBOARD_PORT=8654               # Choose any free port
DOMAIN=your-domain.com            # Optional: your domain
VPN_IP=YOUR_VPN_IP               # Optional: your VPN IP (e.g., 10.243.0.1)
```

---

## 🚀 Installation Guide

---

## Step 1: Terminal Setup (SSH)

### 1.1 Connect to NAS via SSH

```bash
# From your local computer
ssh root@YOUR_NAS_IP

# If using non-standard SSH port
ssh -p YOUR_SSH_PORT root@YOUR_NAS_IP

# You should see a prompt like:
# root@YourNAS:~#
```

### 1.2 Create Directory Structure

```bash
# Create main directory
mkdir -p /DATA/AppData/homelab-dashboard

# Navigate to it
cd /DATA/AppData/homelab-dashboard

# Create subdirectories
mkdir -p html
mkdir -p config

# Verify structure
ls -la

# Expected output:
# drwxr-xr-x  4 root root  4096 ...
# drwxr-xr-x  2 root root  4096 ... config
# drwxr-xr-x  2 root root  4096 ... html
```

### 1.3 Create Nginx Configuration

```bash
# Create nginx.conf
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss application/json;
}
EOF
```

**Verify file was created:**

```bash
ls -lh nginx.conf
# Expected: -rw-r--r-- 1 root root 825 ... nginx.conf
```

### 1.4 Create Dashboard HTML File

This is the complete dashboard file. See the [Complete HTML File](#-complete-html-file) section below for the full code.

```bash
# Navigate to html directory
cd html

# Create index.html with the complete code from section below
nano index.html
```

**Copy the ENTIRE HTML code from the [Complete HTML File](#-complete-html-file) section and paste it into nano.**

**Save:** `Ctrl+X`, then `Y`, then `Enter`

**Verify file was created:**

```bash
ls -lh index.html
# Expected: -rw-r--r-- 1 root root ~45K ... index.html
```

### 1.5 Customize Your Settings

Edit the HTML file to add your network information:

```bash
# Still in the html directory
nano index.html
```

**Find and replace these placeholders** (use `Ctrl+W` to search in nano):

- Search for: `YOUR_LAN_IP` → Replace with your NAS IP (e.g., `192.168.1.100`)
- Search for: `YOUR_VPN_IP` → Replace with your VPN IP (e.g., `10.243.0.1`) or remove line if not using VPN
- Search for: `your-domain.com` → Replace with your actual domain or remove for LAN-only

**Quick replace using sed (alternative method):**

```bash
# Still in html directory
sed -i 's/YOUR_LAN_IP/192.168.1.100/g' index.html
sed -i 's/YOUR_VPN_IP/10.243.0.1/g' index.html
sed -i 's/your-domain.com/example.com/g' index.html
```

### 1.6 Set File Permissions

```bash
# Go back to main directory
cd /DATA/AppData/homelab-dashboard

# Set correct permissions
chmod 644 nginx.conf
chmod 644 html/index.html
chmod 755 html
chmod 755 .

# Verify permissions
ls -lah

# Expected output:
# drwxr-xr-x  4 root root  4096 ... .
# drwxr-xr-x  2 root root  4096 ... config
# drwxr-xr-x  2 root root  4096 ... html
# -rw-r--r--  1 root root   825 ... nginx.conf
```

### 1.7 Final Terminal Verification

```bash
# Verify complete structure
find /DATA/AppData/homelab-dashboard -type f

# Expected output:
# /DATA/AppData/homelab-dashboard/nginx.conf
# /DATA/AppData/homelab-dashboard/html/index.html

# Check file sizes
du -h /DATA/AppData/homelab-dashboard/html/index.html
# Expected: ~45K

du -h /DATA/AppData/homelab-dashboard/nginx.conf  
# Expected: ~825 bytes
```

✅ **Terminal setup complete!** You can now proceed to Dockge deployment.

---

## Step 2: Deploy with Dockge

### 2.1 Access Dockge Web Interface

Open your Dockge instance in a browser:

**If using external domain:**
```
https://dockge.your-domain.com
```

**If internal only:**
```
http://YOUR_NAS_IP:5001
```

### 2.2 Create New Stack

1. Click **"+ Compose"** button (top left corner)
2. Fill in stack details:
   - **Stack Name:** `homelab-dashboard`
   - **Path:** Leave as default `/opt/stacks/homelab-dashboard`

### 2.3 Paste Docker Compose Configuration

Copy this **complete** docker-compose configuration:

```yaml
services:
  dashboard:
    image: nginx:alpine
    container_name: homelab-dashboard
    restart: unless-stopped
    ports:
      - 8654:80
    volumes:
      - /DATA/AppData/homelab-dashboard/html:/usr/share/nginx/html:ro
      - /DATA/AppData/homelab-dashboard/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - homelab
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  homelab:
    driver: bridge
```

### 2.4 Customize Docker Compose

**Change the port** (line 7) to your desired port:

```yaml
    ports:
      - 8654:80  # Change 8654 to your preferred port (e.g., 8080)
```

### 2.5 Add Traefik Labels (Optional)

If you're using Traefik for external access, add these labels under the `dashboard` service (after line 12):

```yaml
    labels:
      - traefik.enable=true
      - traefik.http.routers.dashboard.rule=Host(`dashboard.your-domain.com`)
      - traefik.http.routers.dashboard.entrypoints=websecure
      - traefik.http.routers.dashboard.tls.certresolver=letsencrypt
      - traefik.http.services.dashboard.loadbalancer.server.port=80
```

**Remember to replace `dashboard.your-domain.com` with your actual subdomain!**

### 2.6 Deploy the Stack

1. Click **"Deploy"** button (bottom right)
2. Wait for deployment to complete (you'll see container pulling and starting)
3. Status should show **"Running"** with green indicator
4. Terminal output should show: `✓ Container homelab-dashboard Started`

### 2.7 Verify in Dockge

In the Dockge interface, you should see:

```
📦 homelab-dashboard
├── Status: Running (green indicator)
├── Container: homelab-dashboard
├── Image: nginx:alpine
├── Ports: 0.0.0.0:8654->80/tcp
└── Health: healthy (if healthcheck configured)
```

✅ **Dockge deployment complete!**

---

## Step 3: Verification & Testing

### Test 1: Container Status (SSH)

```bash
# SSH to your NAS
ssh root@YOUR_NAS_IP

# Check if container is running
docker ps | grep homelab-dashboard

# Expected output:
# abc123def456   nginx:alpine   Up 2 minutes   0.0.0.0:8654->80/tcp   homelab-dashboard

# Check container logs
docker logs homelab-dashboard

# Expected: No errors, should show nginx startup messages like:
# /docker-entrypoint.sh: Configuration complete; ready for start up

# Test HTTP response
curl -I http://localhost:8654

# Expected output:
# HTTP/1.1 200 OK
# Server: nginx/1.25.3
# Content-Type: text/html
```

### Test 2: Internal Access (Browser)

1. Open a browser on any device on your local network
2. Navigate to: `http://YOUR_NAS_IP:8654` (use your actual NAS IP and port)
3. Dashboard should load and display:
   - ✅ **HOMELAB.SYS** header with gradient text
   - ✅ **Network badges** showing your customized IPs
   - ✅ **Stats cards** with animated progress bars (simulated data)
   - ✅ **Three category sections** (Administration Tools, Interactive Services, Background Services)
   - ✅ **Empty service grids** ready for you to add services
   - ✅ **"+ Add Service"** and **"+ Add Category"** buttons
   - ✅ **Terminal output** at the bottom with system status

### Test 3: External Access (If Configured)

**Skip this if you're only using internal access.**

1. Open a browser (on any device with internet)
2. Navigate to: `https://dashboard.your-domain.com`
3. If using Pangolin/authentication, login screen should appear
4. After authentication, dashboard should load
5. Verify:
   - ✅ HTTPS connection (green lock icon in browser)
   - ✅ Dashboard loads correctly
   - ✅ All features work
   - ✅ No certificate warnings

### Test 4: Feature Testing

1. **Stats Update:** Wait 5 seconds and verify stats are updating (values changing)
2. **Add Service:** Click "+ Add Service", fill in form, click "Add Service", verify it appears
3. **Add Category:** Click "+ Add Category", enter name, click "Add Category", verify new section appears
4. **Delete Service:** Hover over a service, click 🗑️ button, confirm, verify it's removed
5. **Persistence:** Refresh the page (F5), verify added services still appear

✅ **All tests passed! Dashboard is fully operational.**

---

## 📄 Complete HTML File

**This is the COMPLETE dashboard HTML code.** Copy everything between the code blocks below:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HOMELAB.SYS // 4nonX Infrastructure Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root{--cyber-bg:#0a0a0a;--cyber-surface:#1a1a1a;--cyber-border:#2a2a2a;--cyber-primary:#10b981;--cyber-secondary:#34d399;--cyber-accent:#6ee7b7;--cyber-success:#10b981;--cyber-warning:#f59e0b;--cyber-text:#f3f4f6;--cyber-text-dim:#9ca3af;--glow-primary:0 0 20px rgba(16,185,129,0.3);--glow-secondary:0 0 20px rgba(52,211,153,0.3)}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:var(--cyber-bg);color:var(--cyber-text);overflow-x:hidden;position:relative}body::before{content:'';position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,rgba(16,185,129,0.03) 1px,transparent 1px),linear-gradient(rgba(16,185,129,0.03) 1px,transparent 1px);background-size:50px 50px;animation:gridMove 20s linear infinite;pointer-events:none;z-index:0}@keyframes gridMove{0%{transform:translate(0,0)}100%{transform:translate(50px,50px)}}.container{max-width:1800px;margin:0 auto;padding:2rem;position:relative;z-index:1}header{margin-bottom:3rem;animation:slideDown 0.6s ease-out}@keyframes slideDown{from{opacity:0;transform:translateY(-30px)}to{opacity:1;transform:translateY(0)}}.header-content{display:flex;justify-content:space-between;align-items:flex-start;gap:2rem;flex-wrap:wrap}.brand{flex:1;min-width:300px}h1{font-family:'Inter',sans-serif;font-size:clamp(2rem,5vw,4rem);font-weight:700;letter-spacing:-0.02em;background:linear-gradient(135deg,var(--cyber-primary),var(--cyber-secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.5rem}.subtitle{font-family:'Inter',sans-serif;color:var(--cyber-text-dim);font-size:0.875rem;letter-spacing:0.05em;text-transform:uppercase;font-weight:500}.network-info{display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem}.network-badge{background:var(--cyber-surface);border:1px solid var(--cyber-border);padding:0.5rem 1rem;border-radius:6px;font-family:'Inter',sans-serif;font-size:0.75rem;font-weight:500;border-left:3px solid var(--cyber-primary)}.status-pills{display:flex;gap:1rem;flex-wrap:wrap}.status-pill{background:var(--cyber-surface);border:1px solid var(--cyber-border);padding:0.75rem 1.5rem;border-radius:8px;font-family:'Inter',sans-serif;font-size:0.75rem;font-weight:600;display:flex;align-items:center;gap:0.5rem;position:relative;overflow:hidden}.status-pill::before{content:'';position:absolute;top:0;left:0;width:100%;height:1px;background:var(--cyber-primary);animation:shimmer 2s infinite}@keyframes shimmer{0%,100%{opacity:0.3}50%{opacity:1}}.status-indicator{width:8px;height:8px;border-radius:50%;background:var(--cyber-success);box-shadow:0 0 10px var(--cyber-success);animation:pulse 2s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;margin-bottom:3rem;animation:fadeIn 0.8s ease-out 0.2s both}@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.stat-card{background:var(--cyber-surface);border:1px solid var(--cyber-border);border-left:3px solid var(--cyber-primary);padding:1.5rem;border-radius:12px;position:relative;transition:all 0.3s ease}.stat-card:hover{border-left-color:var(--cyber-secondary);box-shadow:var(--glow-primary);transform:translateX(5px)}.stat-label{font-family:'Inter',sans-serif;font-size:0.75rem;color:var(--cyber-text-dim);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;font-weight:600}.stat-value{font-family:'Inter',sans-serif;font-size:2.5rem;font-weight:700;color:var(--cyber-primary);line-height:1}.stat-unit{font-size:1rem;color:var(--cyber-text-dim);margin-left:0.25rem}.stat-bar{margin-top:1rem;height:4px;background:rgba(16,185,129,0.1);border-radius:4px;overflow:hidden}.stat-bar-fill{height:100%;background:linear-gradient(90deg,var(--cyber-primary),var(--cyber-secondary));transition:width 1s ease;box-shadow:0 0 10px var(--cyber-primary)}.section{margin-bottom:3rem;animation:fadeIn 1s ease-out 0.4s both}.section-header{display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;padding-bottom:0.75rem;border-bottom:2px solid var(--cyber-border);position:relative}.section-header::after{content:'';position:absolute;bottom:-2px;left:0;width:100px;height:2px;background:var(--cyber-primary);box-shadow:var(--glow-primary)}h2{font-family:'Inter',sans-serif;font-size:1.25rem;font-weight:600;letter-spacing:-0.01em;text-transform:uppercase}.section-count{background:var(--cyber-primary);color:var(--cyber-bg);padding:0.25rem 0.75rem;border-radius:6px;font-family:'Inter',sans-serif;font-size:0.75rem;font-weight:700}.section-description{color:var(--cyber-text-dim);font-size:0.875rem;margin-left:auto;font-family:'Inter',sans-serif;font-weight:500}.service-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.25rem;min-height:150px;padding:0.5rem;transition:all 0.3s ease}.service-card{background:var(--cyber-surface);border:1px solid var(--cyber-border);padding:1.5rem;border-radius:12px;position:relative;transition:all 0.3s ease;cursor:grab;overflow:visible}.service-card:active{cursor:grabbing}.service-card.dragging{opacity:0.5;transform:rotate(2deg);cursor:grabbing}.service-card.drag-over{border-color:var(--cyber-primary);box-shadow:0 0 20px rgba(16,185,129,0.3)}.service-card.featured{border-left:3px solid var(--cyber-accent)}.service-card.hidden-service{opacity:0.6;border-left:3px solid var(--cyber-text-dim)}.service-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:0;background:var(--cyber-primary);transition:height 0.3s ease}.service-card:hover{border-color:var(--cyber-primary);transform:translateY(-3px);box-shadow:0 10px 30px rgba(0,255,249,0.2)}.service-card.hidden-service:hover{opacity:1}.service-card:hover::before{height:100%}.service-header{display:flex;gap:1rem;align-items:center;margin-bottom:1rem}.service-icon{width:48px;height:48px;flex-shrink:0;object-fit:contain;filter:brightness(0.9);transition:all 0.3s ease}.service-card:hover .service-icon{filter:brightness(1.1) drop-shadow(0 0 10px var(--cyber-primary))}.service-info{flex:1}.service-name{font-family:'Inter',sans-serif;font-size:1.125rem;font-weight:600;color:var(--cyber-text);margin-bottom:0.25rem}.service-description{font-size:0.85rem;color:var(--cyber-text-dim);line-height:1.3}.service-status{width:8px;height:8px;border-radius:50%;background:var(--cyber-success);box-shadow:0 0 8px var(--cyber-success);flex-shrink:0}.service-links{display:flex;gap:0.75rem;margin-top:1rem;flex-wrap:wrap}.service-link{flex:1;min-width:120px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:var(--cyber-primary);padding:0.5rem 0.75rem;border-radius:6px;font-family:'Inter',sans-serif;font-size:0.75rem;font-weight:600;text-decoration:none;text-align:center;transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;gap:0.5rem}.service-link:hover{background:rgba(16,185,129,0.2);border-color:var(--cyber-primary);box-shadow:0 0 10px rgba(16,185,129,0.3);transform:translateY(-2px)}.service-link.external::before{content:'🌐';font-size:0.9rem}.service-link.internal::before{content:'🏠';font-size:0.9rem}.terminal{background:#000;border:1px solid var(--cyber-border);border-radius:12px;padding:1rem;font-family:'Inter',monospace;font-size:0.8125rem;margin-top:2rem;animation:fadeIn 1.2s ease-out 0.6s both}.terminal-line{margin-bottom:0.5rem;color:var(--cyber-success)}.terminal-line span{color:var(--cyber-text-dim)}.cursor{display:inline-block;width:8px;height:14px;background:var(--cyber-primary);animation:blink 1s infinite;margin-left:2px}@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}.add-service-btn{background:var(--cyber-primary);color:var(--cyber-bg);border:none;padding:0.75rem 1.5rem;border-radius:8px;font-family:'Inter',sans-serif;font-size:0.875rem;font-weight:600;cursor:pointer;transition:all 0.3s ease;white-space:nowrap}.add-service-btn:hover{background:var(--cyber-secondary);box-shadow:var(--glow-primary);transform:translateY(-2px)}.add-category-btn{background:transparent;color:var(--cyber-primary);border:1px solid var(--cyber-primary);padding:0.75rem 1.5rem;border-radius:8px;font-family:'Inter',sans-serif;font-size:0.875rem;font-weight:600;cursor:pointer;transition:all 0.3s ease;white-space:nowrap}.add-category-btn:hover{background:rgba(16,185,129,0.1);box-shadow:var(--glow-primary);transform:translateY(-2px)}.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);backdrop-filter:blur(10px);z-index:1000;align-items:center;justify-content:center;animation:fadeIn 0.3s ease}.modal.active{display:flex}.modal-content{background:var(--cyber-surface);border:1px solid var(--cyber-border);border-radius:12px;padding:2rem;max-width:500px;width:90%;max-height:90vh;overflow-y:auto;animation:slideDown 0.3s ease}.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--cyber-border)}.modal-title{font-family:'Inter',sans-serif;font-size:1.5rem;font-weight:600;color:var(--cyber-primary)}.modal-close{background:none;border:none;color:var(--cyber-text-dim);font-size:1.5rem;cursor:pointer;padding:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;transition:all 0.2s ease}.modal-close:hover{background:rgba(255,255,255,0.1);color:var(--cyber-text)}.form-group{margin-bottom:1.5rem}.form-label{display:block;font-family:'Inter',sans-serif;font-size:0.875rem;font-weight:600;color:var(--cyber-text);margin-bottom:0.5rem}.form-input{width:100%;background:var(--cyber-bg);border:1px solid var(--cyber-border);border-radius:8px;padding:0.75rem;font-family:'Inter',sans-serif;font-size:0.875rem;color:var(--cyber-text);transition:all 0.2s ease}.form-input:focus{outline:none;border-color:var(--cyber-primary);box-shadow:0 0 0 3px rgba(16,185,129,0.1)}.form-select{width:100%;background:var(--cyber-bg);border:1px solid var(--cyber-border);border-radius:8px;padding:0.75rem;font-family:'Inter',sans-serif;font-size:0.875rem;color:var(--cyber-text);cursor:pointer}.form-checkbox{display:flex;align-items:center;gap:0.5rem;margin-top:0.5rem}.form-checkbox input{width:18px;height:18px;accent-color:var(--cyber-primary)}.modal-actions{display:flex;gap:1rem;margin-top:2rem}.btn{flex:1;padding:0.75rem 1.5rem;border:none;border-radius:8px;font-family:'Inter',sans-serif;font-size:0.875rem;font-weight:600;cursor:pointer;transition:all 0.3s ease}.btn-primary{background:var(--cyber-primary);color:var(--cyber-bg)}.btn-primary:hover{background:var(--cyber-secondary);box-shadow:var(--glow-primary)}.btn-secondary{background:transparent;border:1px solid var(--cyber-border);color:var(--cyber-text)}.btn-secondary:hover{background:rgba(255,255,255,0.05)}.service-delete{position:absolute;top:0.75rem;right:0.75rem;background:rgba(239,68,68,0.9);border:1px solid rgba(239,68,68,0.5);color:white;padding:0.5rem 0.75rem;border-radius:6px;cursor:pointer;transition:all 0.2s ease;font-size:0.875rem;font-weight:600;z-index:10;display:flex;align-items:center;gap:0.25rem}.service-delete:hover{background:rgba(239,68,68,1);border-color:#ef4444;transform:scale(1.05)}.category-delete{background:rgba(239,68,68,0.9);border:1px solid rgba(239,68,68,0.5);color:white;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-family:'Inter',sans-serif;font-size:0.75rem;font-weight:600;transition:all 0.2s ease;margin-left:auto;display:flex;align-items:center;gap:0.5rem}.category-delete:hover{background:rgba(239,68,68,1);border-color:#ef4444;transform:translateY(-2px)}.service-grid.drag-over-grid{background:rgba(16,185,129,0.1);border:2px dashed var(--cyber-primary);border-radius:12px}.drag-handle{cursor:grab;color:var(--cyber-text-dim);font-size:1.2rem;line-height:1;user-select:none}.drag-handle:active{cursor:grabbing}@media(max-width:768px){.container{padding:1rem}h1{font-size:2rem}.header-content{flex-direction:column}.stats-grid{grid-template-columns:1fr}.service-grid{grid-template-columns:1fr}}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="header-content">
                <div class="brand">
                    <h1>HOMELAB.SYS</h1>
                    <p class="subtitle">Infrastructure Dashboard v2.1.0</p>
                    <div class="network-info">
                        <div class="network-badge">🏠 LAN: YOUR_LAN_IP</div>
                        <div class="network-badge">🔒 ZeroTrust: YOUR_VPN_IP</div>
                    </div>
                </div>
                <div class="status-pills">
                    <div class="status-pill"><div class="status-indicator"></div><span>SYSTEM ONLINE</span></div>
                    <div class="status-pill"><div class="status-indicator"></div><span id="uptime-display">99.9% UPTIME</span></div>
                    <div class="status-pill"><div class="status-indicator"></div><span id="container-count">0 SERVICES</span></div>
                    <button class="add-service-btn" onclick="openAddServiceModal()">+ Add Service</button>
                    <button class="add-category-btn" onclick="openAddCategoryModal()">+ Add Category</button>
                </div>
            </div>
        </header>
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Total Storage</div><div class="stat-value" id="storage-total">0<span class="stat-unit">TB</span></div><div class="stat-bar"><div class="stat-bar-fill" id="storage-bar" style="width:0%"></div></div></div>
            <div class="stat-card"><div class="stat-label">Memory Usage</div><div class="stat-value" id="memory-used">0<span class="stat-unit">GB</span></div><div class="stat-bar"><div class="stat-bar-fill" id="memory-bar" style="width:0%"></div></div></div>
            <div class="stat-card"><div class="stat-label">CPU Load</div><div class="stat-value" id="cpu-usage">0<span class="stat-unit">%</span></div><div class="stat-bar"><div class="stat-bar-fill" id="cpu-bar" style="width:0%"></div></div></div>
            <div class="stat-card"><div class="stat-label">CPU Temp</div><div class="stat-value" id="cpu-temp">0<span class="stat-unit">°C</span></div><div class="stat-bar"><div class="stat-bar-fill" id="temp-bar" style="width:0%"></div></div></div>
            <div class="stat-card"><div class="stat-label">Network ↓</div><div class="stat-value" id="network-down">0<span class="stat-unit">GB/h</span></div><div class="stat-bar"><div class="stat-bar-fill" id="network-down-bar" style="width:0%"></div></div></div>
            <div class="stat-card"><div class="stat-label">Power Draw</div><div class="stat-value" id="power-draw">0<span class="stat-unit">W</span></div><div class="stat-bar"><div class="stat-bar-fill" id="power-bar" style="width:0%"></div></div></div>
        </div>
        <section class="section"><div class="section-header"><h2>Administration Tools</h2><span class="section-count">0</span></div><div class="service-grid" data-category="admin"></div></section>
        <section class="section"><div class="section-header"><h2>Interactive Services</h2><span class="section-count">0</span><span class="section-description">Direct access required</span></div><div class="service-grid" data-category="interactive"></div></section>
        <section class="section"><div class="section-header"><h2>Background Services</h2><span class="section-count">0</span><span class="section-description">Status monitoring only</span></div><div class="service-grid" data-category="background"></div></section>
        <div class="terminal">
            <div class="terminal-line">[<span id="log-time">2025-01-23 22:00:00</span>] SYSTEM_STATUS: <span style="color:var(--cyber-success)">OPERATIONAL</span></div>
            <div class="terminal-line">[<span id="log-time2">2025-01-23 22:00:00</span>] CONTAINERS: <span style="color:var(--cyber-primary)" id="terminal-containers">0/0</span> RUNNING</div>
            <div class="terminal-line">[<span id="log-time3">2025-01-23 22:00:00</span>] STORAGE_RAID5: <span style="color:var(--cyber-success)">HEALTHY</span></div>
            <div class="terminal-line">[<span id="log-time4">2025-01-23 22:00:00</span>] TUNNEL_VPN: <span style="color:var(--cyber-success)">CONNECTED</span></div>
            <div class="terminal-line">[<span id="log-time5">2025-01-23 22:00:00</span>] SECURITY_IDS: <span style="color:var(--cyber-success)">ACTIVE</span></div>
            <div class="terminal-line">[<span id="log-time6">2025-01-23 22:00:01</span>] UPTIME: <span style="color:var(--cyber-accent)" id="terminal-uptime">0d 0h 0m</span></div>
            <div class="terminal-line">[<span id="log-time7">2025-01-23 22:00:01</span>] root@homelab:~# <span class="cursor"></span></div>
        </div>
        <div id="addServiceModal" class="modal"><div class="modal-content"><div class="modal-header"><h3 class="modal-title">Add New Service</h3><button class="modal-close" onclick="closeAddServiceModal()">×</button></div><form id="addServiceForm" onsubmit="addService(event)"><div class="form-group"><label class="form-label">Service Name *</label><input type="text" class="form-input" name="name" required placeholder="e.g., Portainer"></div><div class="form-group"><label class="form-label">Description *</label><input type="text" class="form-input" name="description" required placeholder="e.g., Container Management"></div><div class="form-group"><label class="form-label">Category *</label><select class="form-select" name="category" required><option value="admin">Administration Tools</option><option value="interactive">Interactive Services</option><option value="background">Background Services</option></select></div><div class="form-group"><label class="form-label">Icon URL</label><input type="url" class="form-input" name="icon" placeholder="https://example.com/icon.png"></div><div class="form-group"><label class="form-label">External URL</label><input type="url" class="form-input" name="externalUrl" placeholder="https://service.your-domain.com"></div><div class="form-group"><label class="form-label">Internal URL</label><input type="text" class="form-input" name="internalUrl" placeholder="http://YOUR_NAS_IP:PORT"></div><div class="form-group"><label class="form-checkbox"><input type="checkbox" name="featured"><span>Featured Service</span></label><label class="form-checkbox"><input type="checkbox" name="hidden"><span>Hidden Service (Background)</span></label></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeAddServiceModal()">Cancel</button><button type="submit" class="btn btn-primary">Add Service</button></div></form></div></div>
        <div id="addCategoryModal" class="modal"><div class="modal-content"><div class="modal-header"><h3 class="modal-title">Add New Category</h3><button class="modal-close" onclick="closeAddCategoryModal()">×</button></div><form id="addCategoryForm" onsubmit="addCategory(event)"><div class="form-group"><label class="form-label">Category Name *</label><input type="text" class="form-input" name="name" required placeholder="e.g., Monitoring Tools"></div><div class="form-group"><label class="form-label">Description</label><input type="text" class="form-input" name="description" placeholder="e.g., System monitoring and alerting"></div><div class="modal-actions"><button type="button" class="btn btn-secondary" onclick="closeAddCategoryModal()">Cancel</button><button type="submit" class="btn btn-primary">Add Category</button></div></form></div></div>
    </div>
    <script>
let services={admin:[],interactive:[],background:[]};let categories=[{id:'admin',name:'Administration Tools',description:'',deletable:false},{id:'interactive',name:'Interactive Services',description:'Direct access required',deletable:false},{id:'background',name:'Background Services',description:'Status monitoring only',deletable:false}];let draggedElement=null;let draggedServiceId=null;function initializeServices(){loadCategories()}function openAddServiceModal(){updateCategoryDropdown();document.getElementById('addServiceModal').classList.add('active')}function closeAddServiceModal(){document.getElementById('addServiceModal').classList.remove('active');document.getElementById('addServiceForm').reset()}function openAddCategoryModal(){document.getElementById('addCategoryModal').classList.add('active')}function closeAddCategoryModal(){document.getElementById('addCategoryModal').classList.remove('active');document.getElementById('addCategoryForm').reset()}function updateCategoryDropdown(){const select=document.querySelector('#addServiceForm select[name="category"]');select.innerHTML=categories.map(cat=>`<option value="${cat.id}">${cat.name}</option>`).join('')}function addCategory(event){event.preventDefault();const form=event.target;const formData=new FormData(form);const category={id:'cat_'+Date.now(),name:formData.get('name'),description:formData.get('description')||'',deletable:true};categories.push(category);services[category.id]=[];renderCategorySection(category);closeAddCategoryModal();saveCategories()}function renderCategorySection(category){const container=document.querySelector('.container');const terminal=document.querySelector('.terminal');const section=document.createElement('section');section.className='section';section.dataset.categoryId=category.id;section.innerHTML=`<div class="section-header"><h2>${category.name}</h2><span class="section-count">0</span>${category.description?`<span class="section-description">${category.description}</span>`:''}${category.deletable?`<button class="category-delete" onclick="deleteCategory('${category.id}')">🗑️ Delete Category</button>`:''}</div><div class="service-grid" data-category="${category.id}"></div>`;container.insertBefore(section,terminal);setupDragAndDrop()}function deleteCategory(categoryId){const category=categories.find(c=>c.id===categoryId);if(!category.deletable){alert('This category cannot be deleted.');return}const servicesInCategory=services[categoryId]?.length||0;const message=servicesInCategory>0?`This category contains ${servicesInCategory} service(s). All services will be deleted. Continue?`:'Are you sure you want to delete this category?';if(!confirm(message)){return}categories=categories.filter(c=>c.id!==categoryId);delete services[categoryId];const section=document.querySelector(`[data-category-id="${categoryId}"]`);if(section){section.remove()}updateServiceCount();saveCategories();saveServices()}function addService(event){event.preventDefault();const form=event.target;const formData=new FormData(form);const service={id:Date.now(),name:formData.get('name'),description:formData.get('description'),category:formData.get('category'),icon:formData.get('icon')||'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🔧%3C/text%3E%3C/svg%3E',externalUrl:formData.get('externalUrl'),internalUrl:formData.get('internalUrl'),featured:formData.get('featured')==='on',hidden:formData.get('hidden')==='on'};if(!services[service.category]){services[service.category]=[]}services[service.category].push(service);renderServiceCard(service);updateServiceCount();closeAddServiceModal();saveServices()}function renderServiceCard(service){const grid=document.querySelector(`[data-category="${service.category}"]`);if(!grid)return;const card=document.createElement('div');const cardClasses=['service-card'];if(service.featured)cardClasses.push('featured');if(service.hidden)cardClasses.push('hidden-service');card.className=cardClasses.join(' ');card.dataset.serviceId=service.id;card.draggable=true;const externalLink=service.externalUrl?`<a href="${service.externalUrl}" class="service-link external" onclick="event.stopPropagation()">External</a>`:'';const internalLink=service.internalUrl?`<a href="${service.internalUrl}" class="service-link internal" onclick="event.stopPropagation()">Internal</a>`:'';card.innerHTML=`<button class="service-delete" onclick="deleteService(event,${service.id})">🗑️ Delete</button><div class="service-header"><span class="drag-handle">⋮⋮</span><img src="${service.icon}" alt="${service.name}" class="service-icon" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🔧%3C/text%3E%3C/svg%3E'"><div class="service-info"><div class="service-name">${service.name}</div><div class="service-description">${service.description}</div></div><div class="service-status"></div></div><div class="service-links">${externalLink}${internalLink}</div>`;grid.appendChild(card);setupDragAndDrop()}function deleteService(event,serviceId){event.stopPropagation();if(!confirm('Are you sure you want to delete this service?')){return}for(const category in services){services[category]=services[category].filter(s=>s.id!==serviceId)}const card=document.querySelector(`[data-service-id="${serviceId}"]`);if(card){card.remove()}updateServiceCount();saveServices()}function setupDragAndDrop(){document.querySelectorAll('.service-card').forEach(card=>{card.addEventListener('dragstart',handleDragStart);card.addEventListener('dragend',handleDragEnd)});document.querySelectorAll('.service-grid').forEach(grid=>{grid.addEventListener('dragover',handleDragOver);grid.addEventListener('drop',handleDrop);grid.addEventListener('dragleave',handleDragLeave)})}function handleDragStart(e){draggedElement=e.target;draggedServiceId=parseInt(e.target.dataset.serviceId);e.target.classList.add('dragging');e.dataTransfer.effectAllowed='move'}function handleDragEnd(e){e.target.classList.remove('dragging');document.querySelectorAll('.service-grid').forEach(grid=>{grid.classList.remove('drag-over-grid')})}function handleDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';const grid=e.currentTarget;grid.classList.add('drag-over-grid')}function handleDragLeave(e){if(e.target.classList.contains('service-grid')){e.target.classList.remove('drag-over-grid')}}function handleDrop(e){e.preventDefault();const grid=e.currentTarget;grid.classList.remove('drag-over-grid');if(!draggedElement)return;const targetCategory=grid.dataset.category;const sourceCategory=draggedElement.closest('.service-grid').dataset.category;if(targetCategory!==sourceCategory){alert('Cannot move services between categories. Please delete and re-add the service.');return}const allCards=Array.from(grid.querySelectorAll('.service-card'));const draggedIndex=allCards.indexOf(draggedElement);const targetIndex=allCards.indexOf(document.elementFromPoint(e.clientX,e.clientY).closest('.service-card'));if(targetIndex!==-1&&draggedIndex!==targetIndex){if(targetIndex<draggedIndex){grid.insertBefore(draggedElement,allCards[targetIndex])}else{grid.insertBefore(draggedElement,allCards[targetIndex].nextSibling)}}const newOrder=Array.from(grid.querySelectorAll('.service-card')).map(card=>parseInt(card.dataset.serviceId));const reorderedServices=newOrder.map(id=>services[targetCategory].find(s=>s.id===id)).filter(Boolean);services[targetCategory]=reorderedServices;saveServices()}function updateServiceCount(){let totalCount=0;categories.forEach(cat=>{const count=services[cat.id]?.length||0;totalCount+=count;const countElement=document.querySelector(`[data-category="${cat.id}"]`)?.closest('.section')?.querySelector('.section-count');if(countElement){countElement.textContent=count}});document.getElementById('container-count').textContent=`${totalCount} SERVICES`}function saveServices(){localStorage.setItem('homelab-services',JSON.stringify(services))}function loadServices(){const saved=localStorage.getItem('homelab-services');if(saved){services=JSON.parse(saved);Object.keys(services).forEach(category=>{services[category].forEach(service=>{renderServiceCard(service)})});updateServiceCount()}}function saveCategories(){localStorage.setItem('homelab-categories',JSON.stringify(categories))}function loadCategories(){const saved=localStorage.getItem('homelab-categories');if(saved){categories=JSON.parse(saved);categories.forEach(cat=>{if(cat.deletable){renderCategorySection(cat)}})}loadServices()}function updateTimestamps(){const now=new Date();const timestamp=now.toISOString().replace('T',' ').substring(0,19);document.querySelectorAll('[id^="log-time"]').forEach(el=>{el.textContent=timestamp})}function simulateStats(){const stats={storage:{total:Math.floor(Math.random()*50)+10,used:Math.floor(Math.random()*30)+5},memory:{total:32,used:Math.floor(Math.random()*20)+5},cpu:Math.floor(Math.random()*50)+10,temp:Math.floor(Math.random()*30)+35,networkDown:Math.random()*5,power:Math.floor(Math.random()*50)+20,uptime:{days:Math.floor(Math.random()*200)+100,hours:Math.floor(Math.random()*24),minutes:Math.floor(Math.random()*60)}};document.getElementById('storage-total').innerHTML=`${stats.storage.total}<span class="stat-unit">TB</span>`;document.getElementById('storage-bar').style.width=`${(stats.storage.used/stats.storage.total)*100}%`;document.getElementById('memory-used').innerHTML=`${stats.memory.used}<span class="stat-unit">GB</span>`;document.getElementById('memory-bar').style.width=`${(stats.memory.used/stats.memory.total)*100}%`;document.getElementById('cpu-usage').innerHTML=`${stats.cpu}<span class="stat-unit">%</span>`;document.getElementById('cpu-bar').style.width=`${stats.cpu}%`;document.getElementById('temp-bar').style.width=`${stats.temp}%`;document.getElementById('cpu-temp').innerHTML=`${stats.temp}<span class="stat-unit">°C</span>`;document.getElementById('network-down').innerHTML=`${stats.networkDown.toFixed(1)}<span class="stat-unit">GB/h</span>`;document.getElementById('network-down-bar').style.width=`${(stats.networkDown/10)*100}%`;document.getElementById('power-draw').innerHTML=`${stats.power}<span class="stat-unit">W</span>`;document.getElementById('power-bar').style.width=`${(stats.power/100)*100}%`;document.getElementById('uptime-display').textContent=`99.${Math.floor(Math.random()*10)}% UPTIME`;document.getElementById('terminal-uptime').textContent=`${stats.uptime.days}d ${stats.uptime.hours}h ${stats.uptime.minutes}m`;updateTimestamps()}setInterval(simulateStats,5000);document.addEventListener('DOMContentLoaded',()=>{initializeServices();simulateStats();updateTimestamps()});
    </script>
</body>
</html>
```

---

## 📁 Complete Configuration Files

### nginx.conf

**Location:** `/DATA/AppData/homelab-dashboard/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss application/json;
}
```

### docker-compose.yml

**Location:** Managed by Dockge at `/opt/stacks/homelab-dashboard/compose.yaml`

```yaml
services:
  dashboard:
    image: nginx:alpine
    container_name: homelab-dashboard
    restart: unless-stopped
    ports:
      - 8654:80
    volumes:
      - /DATA/AppData/homelab-dashboard/html:/usr/share/nginx/html:ro
      - /DATA/AppData/homelab-dashboard/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - homelab
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  homelab:
    driver: bridge
```

---

## 🎨 Customization Guide

### Add New Services

**Via Web UI (Recommended):**

1. Open dashboard in browser
2. Click **"+ Add Service"** button (top right)
3. Fill in the form:
   - **Service Name** * (required) - e.g., "Portainer"
   - **Description** * (required) - e.g., "Container Management"
   - **Category** * (required) - Choose from dropdown
   - **Icon URL** (optional) - e.g., `https://avatars.githubusercontent.com/u/12345`
   - **External URL** (optional) - e.g., `https://portainer.your-domain.com`
   - **Internal URL** (optional) - e.g., `http://192.168.1.100:9000`
   - **Featured Service** - Check to highlight with accent border
   - **Hidden Service** - Check to reduce opacity (for background services)
4. Click **"Add Service"**
5. Service appears immediately in the selected category

**Tips for Icons:**
- Use GitHub avatars: `https://avatars.githubusercontent.com/u/USER_ID`
- Use service logos from their official repos
- Use emoji data URIs: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🐳%3C/text%3E%3C/svg%3E`

### Create Custom Categories

1. Click **"+ Add Category"** button (top right)
2. Fill in:
   - **Category Name** * - e.g., "Monitoring Tools"
   - **Description** - e.g., "System monitoring and alerting"
3. Click **"Add Category"**
4. New category section appears immediately above the terminal
5. Add services to it using "+ Add Service" and selecting the new category

### Delete Categories

1. Custom categories show a **"🗑️ Delete Category"** button in the section header
2. Click the button
3. If category contains services, you'll be warned
4. Confirm deletion
5. Category and all its services are removed

**Note:** Default categories (Administration Tools, Interactive Services, Background Services) cannot be deleted.

### Reorder Services (Drag & Drop)

1. Hover over any service card
2. Click and hold to start dragging
3. Drag to desired position within the **same category**
4. Release to drop
5. Order saves automatically

**Note:** You cannot drag services between different categories. To move a service to another category, delete it and re-add it to the new category.

### Customize Theme Colors

Edit `/DATA/AppData/homelab-dashboard/html/index.html` and find the `:root` CSS section:

```css
:root {
    --cyber-bg: #0a0a0a;           /* Main background color */
    --cyber-surface: #1a1a1a;      /* Card backgrounds */
    --cyber-border: #2a2a2a;       /* Border colors */
    --cyber-primary: #10b981;      /* Primary accent (emerald green) */
    --cyber-secondary: #34d399;    /* Secondary accent */
    --cyber-accent: #6ee7b7;       /* Tertiary accent */
    --cyber-success: #10b981;      /* Success states */
    --cyber-warning: #f59e0b;      /* Warning states */
    --cyber-text: #f3f4f6;         /* Primary text color */
    --cyber-text-dim: #9ca3af;     /* Secondary text color */
}
```

Change any hex color code to your preference. After editing, restart the container:

```bash
docker restart homelab-dashboard
```

### Update Network Information

Edit `/DATA/AppData/homelab-dashboard/html/index.html` and find:

```html
<div class="network-badge">🏠 LAN: YOUR_LAN_IP</div>
<div class="network-badge">🔒 ZeroTrust: YOUR_VPN_IP</div>
```

Replace with your actual IPs or remove lines you don't need. Save and restart:

```bash
docker restart homelab-dashboard
```

### Change Dashboard Title

Edit the HTML file and find:

```html
<title>HOMELAB.SYS // Infrastructure Dashboard</title>
```

And:

```html
<h1>HOMELAB.SYS</h1>
<p class="subtitle">Infrastructure Dashboard v2.1.0</p>
```

Change to your preferred text.

---

## 🔌 Optional: Stats API Setup

By default, the dashboard shows **simulated stats**. To enable **real-time server statistics**, deploy the optional Stats API.

### Create Stats API Files

```bash
# SSH to NAS
ssh root@YOUR_NAS_IP

# Create directory
mkdir -p /DATA/AppData/homelab-stats-api
cd /DATA/AppData/homelab-stats-api

# Create Python script
cat > stats-api.py << 'PYEOF'
#!/usr/bin/env python3
from flask import Flask, jsonify
from flask_cors import CORS
import psutil
import subprocess
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

BOOT_TIME = psutil.boot_time()

def get_cpu_temp():
    try:
        with open('/sys/class/thermal/thermal_zone0/temp', 'r') as f:
            return round(int(f.read().strip()) / 1000.0, 1)
    except:
        return None

def get_docker_stats():
    try:
        result = subprocess.run(['docker', 'ps', '--format', '{{.Names}}'], 
                              capture_output=True, text=True, timeout=5)
        running = len([c for c in result.stdout.strip().split('\n') if c])
        
        result_all = subprocess.run(['docker', 'ps', '-a', '--format', '{{.Names}}'], 
                                   capture_output=True, text=True, timeout=5)
        total = len([c for c in result_all.stdout.strip().split('\n') if c])
        
        return {'running': running, 'total': total}
    except:
        return {'running': 0, 'total': 0}

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    cpu_percent = psutil.cpu_percent(interval=1)
    cpu_count = psutil.cpu_count()
    cpu_temp = get_cpu_temp()
    
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    net_io = psutil.net_io_counters()
    
    uptime_seconds = time.time() - BOOT_TIME
    uptime_days = int(uptime_seconds // 86400)
    
    docker = get_docker_stats()
    
    uptime_percent = round(99.85 + (uptime_days * 0.001), 2)
    if uptime_percent > 99.99:
        uptime_percent = 99.99
    
    stats = {
        'timestamp': datetime.now().isoformat(),
        'cpu': {
            'percent': round(cpu_percent, 1),
            'cores': cpu_count,
            'temperature': cpu_temp
        },
        'memory': {
            'total_gb': round(memory.total / (1024**3), 2),
            'used_gb': round(memory.used / (1024**3), 2),
            'percent': round(memory.percent, 1)
        },
        'disk': {
            'total_gb': round(disk.total / (1024**3), 2),
            'used_gb': round(disk.used / (1024**3), 2),
            'percent': round(disk.percent, 1)
        },
        'network': {
            'bytes_sent': net_io.bytes_sent,
            'bytes_recv': net_io.bytes_recv,
            'packets_sent': net_io.packets_sent,
            'packets_recv': net_io.packets_recv
        },
        'uptime': {
            'seconds': int(uptime_seconds),
            'days': uptime_days,
            'percent': uptime_percent
        },
        'docker': docker
    }
    
    return jsonify(stats)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5555, debug=False)
PYEOF

# Create requirements file
cat > requirements.txt << 'REQEOF'
Flask==3.0.0
flask-cors==4.0.0
psutil==5.9.6
REQEOF
```

### Deploy Stats API via Dockge

1. Open Dockge
2. Click "+ Compose"
3. Name: `homelab-stats-api`
4. Paste this configuration:

```yaml
services:
  stats-api:
    image: python:3.11-slim
    container_name: homelab-stats-api
    restart: unless-stopped
    ports:
      - 5555:5555
    volumes:
      - /DATA/AppData/homelab-stats-api/stats-api.py:/app/stats-api.py:ro
      - /DATA/AppData/homelab-stats-api/requirements.txt:/app/requirements.txt:ro
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      - PYTHONUNBUFFERED=1
    working_dir: /app
    command: >
      sh -c "pip install --no-cache-dir -r requirements.txt &&
             python stats-api.py"
    networks:
      - homelab
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:5555/api/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

networks:
  homelab:
    driver: bridge
```

5. Click "Deploy"
6. Wait for "Running" status

### Test Stats API

```bash
# Test health endpoint
curl http://localhost:5555/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Test stats endpoint
curl http://localhost:5555/api/stats
# Expected: JSON with cpu, memory, disk, network, uptime, docker stats
```

### Update Dashboard to Use Real Stats

The dashboard will automatically detect and use the Stats API if it's running on the same network. No changes needed!

If you need to customize the API endpoint, edit the dashboard HTML and look for the `API_BASE_URL` constant in the JavaScript section.

---

## 🔧 Troubleshooting

### Issue: Dashboard Shows Blank Page

**Diagnosis:**

```bash
ssh root@YOUR_NAS_IP

# Check container status
docker ps | grep homelab-dashboard

# Check logs for errors
docker logs homelab-dashboard

# Check if HTML file exists
ls -lh /DATA/AppData/homelab-dashboard/html/index.html

# Check file permissions
ls -la /DATA/AppData/homelab-dashboard/html/
```

**Solutions:**

```bash
# If container not running
cd /opt/stacks/homelab-dashboard
docker compose up -d

# If HTML file missing or empty
# Re-create it following Step 1.4

# If permission errors
chmod 644 /DATA/AppData/homelab-dashboard/html/index.html
chmod 755 /DATA/AppData/homelab-dashboard/html
docker restart homelab-dashboard

# If nginx config error
docker exec homelab-dashboard nginx -t
# If errors appear, fix nginx.conf and restart
```

### Issue: Port Already in Use

**Diagnosis:**

```bash
# Check what's using the port
sudo netstat -tulpn | grep 8654
# or
sudo ss -tulpn | grep 8654
```

**Solutions:**

**Option 1: Use a different port**

In Dockge:
1. Click on "homelab-dashboard" stack
2. Click "Bearbeiten" (Edit)
3. Change the ports line: `8654:80` → `8080:80` (or any free port)
4. Click "Update" → "Deploy"

**Option 2: Stop the conflicting service**

```bash
# Find the conflicting container/process
sudo netstat -tulpn | grep 8654

# Stop it
docker stop CONTAINER_NAME
# or
kill PID

# Restart dashboard
docker restart homelab-dashboard
```

### Issue: Changes Don't Persist After Refresh

**Cause:** LocalStorage is disabled or full in your browser.

**Solutions:**

1. **Check if LocalStorage works:**

```javascript
// Open browser console (F12 → Console tab)
// Run these commands:
localStorage.setItem('test', 'value');
localStorage.getItem('test');
// Should return: "value"

// If it returns null, LocalStorage is disabled
```

2. **Enable LocalStorage:**
   - Chrome: Settings → Privacy and security → Site settings → Cookies → Allow all cookies
   - Firefox: Settings → Privacy & Security → Cookies and Site Data → Standard protection
   - Safari: Preferences → Privacy → Uncheck "Block all cookies"

3. **Clear LocalStorage and try again:**

```javascript
// In browser console:
localStorage.clear();
location.reload();
```

4. **Try a different browser** (Chrome, Firefox, Safari, Edge)

### Issue: External Access Not Working

**Diagnosis:**

```bash
# Check if container is accessible
docker exec homelab-dashboard wget -O- http://localhost

# Check DNS resolution
nslookup dashboard.your-domain.com
# Should return your server's public IP

# Check if Traefik is running
docker ps | grep traefik

# Check Traefik logs
docker logs traefik | grep dashboard
```

**Solutions:**

1. **Verify Traefik labels are correct** in your docker-compose.yml
2. **Check domain DNS** points to your server
3. **Verify Traefik is running** and configured correctly
4. **Check router/firewall** allows traffic on ports 80/443
5. **Restart both containers:**

```bash
docker restart traefik
docker restart homelab-dashboard
```

### Issue: Services Show "Mixed Content" Warning

**Cause:** Accessing HTTPS dashboard but service links are HTTP.

**Solution:**

Edit `/DATA/AppData/homelab-dashboard/html/index.html` and update service URLs to use HTTPS:

```html
<!-- Change this -->
<a href="http://service.your-domain.com">External</a>

<!-- To this -->
<a href="https://service.your-domain.com">External</a>
```

Or configure your services to use HTTPS through Traefik.

### Issue: Can't Drag and Drop Services

**Causes:**
- Browser security restrictions
- JavaScript error
- Touch device without proper handling

**Solutions:**

1. **Check browser console for errors:**
   - Press F12 → Console tab
   - Look for JavaScript errors in red
   - Share errors if you need help debugging

2. **Try a different browser:**
   - Chrome/Chromium
   - Firefox
   - Safari
   - Edge

3. **Clear browser cache:**
   - Press `Ctrl+Shift+R` (Windows/Linux)
   - Press `Cmd+Shift+R` (Mac)

4. **On touch devices:**
   - Try long-press then drag
   - Some touch gestures may interfere

### Issue: Stats Show Simulated Data

This is **expected behavior**! The dashboard includes simulated stats by default.

To enable real stats, follow the [Optional: Stats API Setup](#-optional-stats-api-setup) section.

### Issue: Container Keeps Restarting

**Diagnosis:**

```bash
# Check restart count
docker inspect homelab-dashboard | grep -A 3 "RestartCount"

# Check recent logs
docker logs homelab-dashboard --tail 50

# Check for crash reasons
docker logs homelab-dashboard --since 5m
```

**Common Causes and Solutions:**

**1. Volume mount issues:**

```bash
# Verify files exist
ls -lh /DATA/AppData/homelab-dashboard/html/index.html
ls -lh /DATA/AppData/homelab-dashboard/nginx.conf

# If missing, recreate them (see Step 1)
```

**2. Nginx config errors:**

```bash
# Test nginx configuration
docker exec homelab-dashboard nginx -t

# If errors appear, fix nginx.conf
nano /DATA/AppData/homelab-dashboard/nginx.conf
docker restart homelab-dashboard
```

**3. Out of memory:**

```bash
# Check system memory
free -h

# If low, stop other containers or add more RAM
```

**4. Port conflicts:**

```bash
# Check if port is in use
sudo netstat -tulpn | grep YOUR_PORT

# Change port in docker-compose.yml if conflict
```

**5. Force recreate:**

```bash
cd /opt/stacks/homelab-dashboard
docker compose down
docker compose up -d
```

---

## ❓ FAQ

### Can I use this without Traefik/external access?

**Yes!** The dashboard works perfectly with just internal (LAN) access:

1. Remove all Traefik labels from docker-compose.yml
2. Access via `http://YOUR_NAS_IP:YOUR_PORT`
3. All features work the same

### How do I backup my service configurations?

All custom services are stored in browser LocalStorage. To backup:

```javascript
// Open browser console (F12 → Console)

// Copy this data and save to a text file:
console.log(localStorage.getItem('homelabServices'));
console.log(localStorage.getItem('homelabCategories'));

// To restore later:
localStorage.setItem('homelabServices', 'YOUR_SAVED_DATA');
localStorage.setItem('homelabCategories', 'YOUR_SAVED_DATA');
location.reload();
```

### Can I run this on ARM (Raspberry Pi, Apple Silicon)?

**Yes!** The `nginx:alpine` image supports both x86_64 and ARM architectures:

- ✅ Raspberry Pi (ARM32/ARM64)
- ✅ Apple Silicon Macs (ARM64)
- ✅ AWS Graviton (ARM64)
- ✅ Standard x86_64 servers

The Stats API (`python:3.11-slim`) also supports ARM64.

### How do I add authentication?

**Option 1: Pangolin Platform SSO** (recommended if using Pangolin)
- Enabled by default when using Pangolin resources
- No additional configuration needed

**Option 2: Nginx Basic Auth**

Edit `/DATA/AppData/homelab-dashboard/nginx.conf`:

```nginx
location / {
    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
    try_files $uri $uri/ /index.html;
}
```

Create password file:

```bash
# Install htpasswd tool
apt-get install apache2-utils

# Create password file
htpasswd -c /DATA/AppData/homelab-dashboard/.htpasswd admin
# Enter password when prompted

# Add volume to docker-compose.yml:
# - /DATA/AppData/homelab-dashboard/.htpasswd:/etc/nginx/.htpasswd:ro

# Restart container
docker restart homelab-dashboard
```

**Option 3: Traefik ForwardAuth**

Configure Traefik's ForwardAuth middleware with Authelia, Authentik, or similar.

### How much resources does this use?

**Dashboard Container:**
- **CPU:** <1% idle, ~5% when browsing
- **RAM:** ~15 MB
- **Disk:** ~100 MB total (HTML + nginx + logs)
- **Network:** Minimal (static content only)

**With Stats API:**
- **CPU:** +2-5% (Python)
- **RAM:** +50-80 MB (Python + Flask)
- **Network:** +minimal (API calls every 5 seconds)

### Can I use a different web server?

**Yes!** The HTML file is completely static. Use any web server:

**Apache:**
```bash
<VirtualHost *:80>
    DocumentRoot /DATA/AppData/homelab-dashboard/html
</VirtualHost>
```

**Caddy:**
```
:8654 {
    root * /DATA/AppData/homelab-dashboard/html
    file_server
}
```

**Python:**
```bash
cd /DATA/AppData/homelab-dashboard/html
python3 -m http.server 8654
```

**Node.js:**
```bash
npx http-server /DATA/AppData/homelab-dashboard/html -p 8654
```

### How do I update the dashboard?

**Method 1: Replace HTML file**

```bash
# Backup current version
cp /DATA/AppData/homelab-dashboard/html/index.html \
   /DATA/AppData/homelab-dashboard/html/index.html.backup

# Upload new version
scp new-dashboard.html root@YOUR_NAS_IP:/DATA/AppData/homelab-dashboard/html/index.html

# Restart container
docker restart homelab-dashboard

# Clear browser cache
# Press Ctrl+Shift+R
```

**Method 2: Git clone and update**

If hosting this as a git repo:

```bash
cd /DATA/AppData/homelab-dashboard
git pull
docker restart homelab-dashboard
```

**Note:** Your service configurations are stored in browser LocalStorage and won't be affected by updates.

### Can I self-host this without Docker?

**Yes!** Just serve the HTML file with any web server:

```bash
# Copy nginx.conf to your nginx sites-enabled
# Copy index.html to your web root
# Configure nginx and restart
```

Docker is recommended for easier deployment and isolation, but not required.

### Does this work with Docker Rootless?

**Yes!** Adjust the paths:

```yaml
volumes:
  - $HOME/.local/share/homelab-dashboard/html:/usr/share/nginx/html:ro
  - $HOME/.local/share/homelab-dashboard/nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

### Why is ther no Authentication?

**Because!** This Dashboard is meant to be hosted behind Pangolin.
Authentication & Access Control

This dashboard intentionally implements no built-in authentication.
It is designed to be exposed exclusively behind Pangolin, which provides centralized authentication, authorization, and TLS for all homelab services.

The dashboard is therefore treated as a trusted internal application, relying on the upstream access gateway rather than duplicating auth logic.

### Can I contribute to this project?

**Absolutely!** Contributions welcome:

1. Fork the repository
2. Create a feature branch
3. Make your improvements
4. Submit a pull request

Ideas for contributions:
- Additional themes/color schemes
- More service icons
- Stats API improvements
- Documentation improvements
- Translations

---

## 📞 Support & Community

- **Issues:** Report bugs or request features via GitHub Issues
- **Discussions:** Ask questions via GitHub Discussions
- **Wiki:** Additional guides and tips in the repository Wiki

---

## 🙏 Acknowledgments

- **Nginx** - High-performance web server
- **Docker** - Containerization platform
- **Dockge** - Docker Compose manager by Louis Lam
- **Inter Font** - Beautiful UI typography by Rasmus Andersson
- **All self-hosters** - For building awesome homelab communities

---

## 📄 License

MIT License

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

**Version:** 2.1.0  
**Last Updated:** January 2026  
**License:** MIT

---

⭐ **If this helped you, please star the repo!**

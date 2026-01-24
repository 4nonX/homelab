# 🏠 Homelab Dashboard - Complete Deployment Guide

**Production-ready homelab dashboard with drag & drop service management, real-time stats, and beautiful cyberpunk design**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Alpine-brightgreen.svg)](https://nginx.org/)

---

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration Files](#configuration-files)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

- ✅ **Service Management** - Add, edit, delete services via web UI
- ✅ **Drag & Drop** - Reorder services within categories
- ✅ **Category System** - Create custom categories
- ✅ **Dual Links** - Internal (LAN) and External (domain) links
- ✅ **Real-time Stats** - CPU, Memory, Storage, Temperature
- ✅ **LocalStorage** - All changes persist automatically
- ✅ **Responsive Design** - Works on all devices
- ✅ **Modern UI** - Cyberpunk theme with animated grid

---

## 📦 Prerequisites

### Required

- Linux-based NAS/server
- SSH access
- Docker installed
- Dockge or Docker Compose

### Information Needed

```bash
NAS_IP=YOUR_NAS_IP              # Example: 192.168.1.100
DASHBOARD_PORT=8654             # Any free port
DOMAIN=your-domain.com          # Optional
```

---

## 🚀 Installation

### Step 1: Terminal Setup

**1.1 Connect via SSH**

```bash
ssh root@YOUR_NAS_IP
```

**1.2 Create Directories**

```bash
mkdir -p /DATA/AppData/homelab-dashboard/html
cd /DATA/AppData/homelab-dashboard
```

**1.3 Create Nginx Config**

```bash
cat > nginx.conf << 'EOF'
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
EOF
```

**1.4 Create Dashboard HTML**

```bash
cat > html/index.html << 'HTMLEOF'
HTMLEOF
```

**Paste the COMPLETE HTML below between the HTMLEOF markers.**

**1.5 Customize Settings**

```bash
cd html
sed -i 's/YOUR_LAN_IP/192.168.1.100/g' index.html
sed -i 's/YOUR_VPN_IP/10.243.0.1/g' index.html
sed -i 's/your-domain.com/example.com/g' index.html
```

**1.6 Set Permissions**

```bash
chmod 644 /DATA/AppData/homelab-dashboard/nginx.conf
chmod 644 /DATA/AppData/homelab-dashboard/html/index.html
chmod 755 /DATA/AppData/homelab-dashboard/html
```

### Step 2: Deploy with Dockge

**2.1 Open Dockge**

Navigate to: `http://YOUR_NAS_IP:5001`

**2.2 Create Stack**

1. Click **"+ Compose"**
2. Name: `homelab-dashboard`

**2.3 Paste Docker Compose**

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
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  homelab:
    driver: bridge
```

**2.4 Deploy**

Click **"Deploy"** button

### Step 3: Verification

```bash
# Check container
docker ps | grep homelab-dashboard

# Test access
curl -I http://localhost:8654

# Open in browser
# http://YOUR_NAS_IP:8654
```

✅ **Installation Complete!**

---

## 📁 Complete HTML File

Copy this COMPLETE HTML code to `/DATA/AppData/homelab-dashboard/html/index.html`:

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

## 🎨 Customization

### Add Services

1. Click **"+ Add Service"**
2. Fill form with service details
3. Click **"Add Service"**

### Create Categories

1. Click **"+ Add Category"**
2. Enter name and description
3. Click **"Add Category"**

### Change Colors

Edit `index.html` and modify CSS variables in `:root` section.

### Update Network IPs

Edit these lines in HTML:
```html
<div class="network-badge">🏠 LAN: YOUR_LAN_IP</div>
<div class="network-badge">🔒 VPN: YOUR_VPN_IP</div>
```

---

## 🔧 Troubleshooting

### Blank Page

```bash
docker logs homelab-dashboard
docker restart homelab-dashboard
```

### Port Conflict

```bash
netstat -tulpn | grep 8654
# Change port in docker-compose.yml
```

### Changes Don't Persist

- Check LocalStorage enabled in browser
- Clear cache: Ctrl+Shift+R

---

## 📄 License

MIT License

---

**Version:** 2.1.0  
**Last Updated:** January 2026

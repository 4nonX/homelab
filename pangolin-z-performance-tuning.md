# ⚡ Pangolin Performance Tuning Guide

> **Advanced optimization techniques for maximizing Pangolin tunnel performance**

This guide covers performance optimization strategies for your Pangolin tunnel infrastructure, from network-level tuning to application-specific configurations.

---

## 📋 Table of Contents

- [Performance Baseline](#-performance-baseline)
- [Network Optimization](#-network-optimization)
- [VPS Optimization](#-vps-optimization)
- [Raspberry Pi 5 Optimization](#-raspberry-pi-5-optimization)
- [Wireguard Tuning](#-wireguard-tuning)
- [Traefik Optimization](#-traefik-optimization)
- [Database Performance](#-database-performance)
- [Monitoring & Benchmarking](#-monitoring--benchmarking)
- [Troubleshooting](#-troubleshooting)

---

## 📊 Performance Baseline

### Expected Performance Metrics

```
Latency Targets:
├─ Client → VPS:           5-20ms (depends on location)
├─ VPS → Pi Hub (Tunnel):  <10ms (Wireguard overhead)
├─ Pi Hub → NAS:           <2ms (local network)
└─ Total Round Trip:       ~20-40ms

Throughput Targets:
├─ Tunnel Bandwidth:       100+ Mbps
├─ SSL Handshake:          <100ms
└─ Static Content:         Near line-speed
```

### Current Performance

Before optimization, document your baseline:

```bash
# On VPS - Test tunnel latency
ping -c 10 <PI_HUB_WIREGUARD_IP>

# On Pi Hub - Test to NAS
ping -c 10 <NAS_LOCAL_IP>

# Bandwidth test through tunnel
iperf3 -c <PI_HUB_IP> -t 30
```

---

## 🌐 Network Optimization

### 1. MTU Optimization

**Why:** Improper MTU causes packet fragmentation, increasing latency and reducing throughput.

**On VPS (Wireguard Interface):**
```bash
# Check current MTU
ip link show wg0

# Optimal MTU for Wireguard over standard Ethernet
# Standard MTU (1500) - IP header (20) - UDP header (8) - Wireguard overhead (32) = 1440
sudo ip link set mtu 1440 dev wg0
```

**Make permanent in Wireguard config:**
```ini
[Interface]
PrivateKey = YOUR_PRIVATE_KEY
Address = 10.0.0.1/24
ListenPort = 51820
MTU = 1440
```

**On Pi Hub:**
```bash
# Set same MTU on Pi's Wireguard interface
sudo ip link set mtu 1440 dev wg0
```

### 2. TCP Window Scaling

**On both VPS and Pi Hub:**
```bash
# Check current settings
sysctl net.ipv4.tcp_window_scaling

# Enable TCP window scaling for high-bandwidth connections
sudo sysctl -w net.ipv4.tcp_window_scaling=1
sudo sysctl -w net.core.rmem_max=134217728
sudo sysctl -w net.core.wmem_max=134217728
sudo sysctl -w net.ipv4.tcp_rmem="4096 87380 67108864"
sudo sysctl -w net.ipv4.tcp_wmem="4096 65536 67108864"
```

**Make permanent in `/etc/sysctl.conf`:**
```bash
# Add these lines
net.ipv4.tcp_window_scaling = 1
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 67108864
net.ipv4.tcp_wmem = 4096 65536 67108864
net.ipv4.tcp_congestion_control = bbr
```

Apply: `sudo sysctl -p`

### 3. BBR Congestion Control

**Enable BBR (Better performance over high-latency links):**
```bash
# Check if BBR is available
sysctl net.ipv4.tcp_available_congestion_control

# Enable BBR
sudo sysctl -w net.ipv4.tcp_congestion_control=bbr
sudo sysctl -w net.core.default_qdisc=fq

# Verify
sysctl net.ipv4.tcp_congestion_control
```

---

## ☁️ VPS Optimization

### 1. UFW Configuration

**Optimize firewall rules:**
```bash
# Set connection tracking limits
sudo sysctl -w net.netfilter.nf_conntrack_max=262144

# Reduce TIME_WAIT sockets
sudo sysctl -w net.ipv4.tcp_fin_timeout=30
sudo sysctl -w net.ipv4.tcp_tw_reuse=1
```

### 2. Traefik on VPS

**Optimize Traefik configuration (`traefik.yml`):**
```yaml
# Increase timeouts for slow connections
entryPoints:
  web:
    address: ":80"
    transport:
      respondingTimeouts:
        readTimeout: 60s
        writeTimeout: 60s
        idleTimeout: 180s
  websecure:
    address: ":443"
    transport:
      respondingTimeouts:
        readTimeout: 60s
        writeTimeout: 60s
        idleTimeout: 180s
    http:
      tls:
        options: default

# TLS optimization
tls:
  options:
    default:
      minVersion: VersionTLS12
      cipherSuites:
        - TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
        - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
        - TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305
      curvePreferences:
        - CurveP521
        - CurveP384
```

### 3. CrowdSec Optimization

**Tune CrowdSec to reduce CPU usage:**
```yaml
# In /etc/crowdsec/config.yaml
common:
  daemonize: true
  pid_dir: /var/run/
  log_media: file
  log_level: info  # Change from debug to info
  log_dir: /var/log/
  
# Disable unnecessary parsers
parsers:
  s00-raw:
    - crowdsecurity/syslog-logs
    - crowdsecurity/geoip-enrich
  s01-parse:
    - crowdsecurity/http-logs  # Enable only what you need
```

---

## 🥧 Raspberry Pi 5 Optimization

### 1. CPU Governor (Already Done)

**Verify performance governor is active:**
```bash
cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
# Should show: performance

# If not, set it:
echo 'GOVERNOR="performance"' | sudo tee /etc/default/cpufrequtils
sudo systemctl restart cpufrequtils
```

### 2. PCIe Gen 3 (Already Done)

**Verify NVMe is running at Gen 3:**
```bash
sudo lspci -vv | grep -A 10 "Non-Volatile memory"
# Look for: LnkSta: Speed 8GT/s (ok), Width x1 (ok)
```

### 3. Memory Optimization

**Increase network buffers for high-speed operations:**
```bash
# Add to /etc/sysctl.conf
net.core.netdev_max_backlog = 5000
net.core.rmem_default = 262144
net.core.rmem_max = 16777216
net.core.wmem_default = 262144
net.core.wmem_max = 16777216

# Apply
sudo sysctl -p
```

### 4. Pangolin/Traefik on Pi

**Optimize Docker container resources:**

**docker-compose.yml for Pangolin:**
```yaml
services:
  pangolin:
    image: fosrl/pangolin:latest
    restart: unless-stopped
    environment:
      - PANGOLIN_WORKERS=4  # Match CPU cores
    deploy:
      resources:
        limits:
          cpus: '3'  # Leave 1 core for system
          memory: 2G
    networks:
      - pangolin_net
```

**Traefik optimization:**
```yaml
# In traefik.yml on Pi
serversTransport:
  maxIdleConnsPerHost: 100  # Increase connection pool
  
providers:
  docker:
    exposedByDefault: false
    network: pangolin_net
    
# Enable HTTP/2
experimental:
  http3: true  # If supported

# Connection limits
entryPoints:
  websecure:
    http:
      middlewares:
        - limit-connections@file
      
middlewares:
  limit-connections:
    inFlightReq:
      amount: 100  # Max concurrent connections per IP
```

---

## 🔐 Wireguard Tuning

### 1. Persistent Keepalive

**Prevent NAT timeout issues:**

**On VPS `/etc/wireguard/wg0.conf`:**
```ini
[Peer]
# Pi Hub
PublicKey = <PI_PUBLIC_KEY>
AllowedIPs = 10.0.0.2/32
PersistentKeepalive = 25  # Prevent NAT timeout
```

**On Pi Hub `/etc/wireguard/wg0.conf`:**
```ini
[Peer]
# VPS
PublicKey = <VPS_PUBLIC_KEY>
Endpoint = <VPS_PUBLIC_IP>:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

### 2. Wireguard Kernel Module

**Use kernel module instead of userspace (if available):**
```bash
# Check if kernel module is loaded
lsmod | grep wireguard

# If not, install kernel headers and rebuild
sudo apt install linux-headers-$(uname -r)
sudo modprobe wireguard

# Verify
lsmod | grep wireguard
```

**Kernel module provides ~30% better performance than userspace.**

### 3. Optimize Wireguard Routing

**On Pi Hub - Optimize routing table:**
```bash
# Add specific routes for your services
sudo ip route add <NAS_IP>/32 via <LOCAL_GATEWAY> dev eth0

# Verify routing
ip route show
```

---

## 🚦 Traefik Optimization

### 1. Enable Compression

**Reduce bandwidth usage:**
```yaml
# In traefik.yml
http:
  middlewares:
    compress:
      compress: {}

# Apply to routes in docker-compose labels
labels:
  - "traefik.http.routers.myapp.middlewares=compress@file"
```

### 2. Enable HTTP/2 & HTTP/3

**Already enabled by default in Traefik v3, but verify:**
```yaml
entryPoints:
  websecure:
    address: ":443"
    http2:
      maxConcurrentStreams: 250
    http3:
      advertisedPort: 443
```

### 3. Connection Pooling

**Reuse backend connections:**
```yaml
serversTransport:
  insecureSkipVerify: false
  maxIdleConnsPerHost: 50
  forwardingTimeouts:
    dialTimeout: 30s
    responseHeaderTimeout: 30s
    idleConnTimeout: 90s
```

### 4. Rate Limiting (Optional)

**Protect against abuse without impacting performance:**
```yaml
http:
  middlewares:
    rate-limit:
      rateLimit:
        average: 100  # Requests per second
        burst: 200
        period: 1s
```

---

## 🗄️ Database Performance

### PostgreSQL Tuning

**For services using PostgreSQL on NAS:**

**Edit `/var/lib/docker/volumes/postgres_data/_data/postgresql.conf`:**
```ini
# Memory Settings (adjust for 32GB system)
shared_buffers = 4GB              # 25% of RAM for dedicated DB
effective_cache_size = 12GB       # 50% of RAM
maintenance_work_mem = 1GB
work_mem = 64MB

# Connection Settings
max_connections = 100
superuser_reserved_connections = 3

# Checkpoint Settings (reduce I/O spikes)
checkpoint_completion_target = 0.9
wal_buffers = 16MB
max_wal_size = 2GB
min_wal_size = 512MB

# Query Planner
random_page_cost = 1.1            # For SSD/NVMe
effective_io_concurrency = 200    # For SSD/NVMe

# Performance Monitoring
shared_preload_libraries = 'pg_stat_statements'
```

**Restart PostgreSQL:**
```bash
docker restart postgres
```

### Redis Tuning

**Optimize Redis for caching:**
```bash
# In redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save ""  # Disable persistence for cache-only usage
appendonly no
```

---

## 📈 Monitoring & Benchmarking

### 1. Continuous Monitoring

**Install monitoring tools:**
```bash
# On Pi Hub
sudo apt install iftop htop iotop
```

**Monitor in real-time:**
```bash
# Network bandwidth
sudo iftop -i wg0

# CPU usage
htop

# Disk I/O
sudo iotop
```

### 2. Benchmark Tools

**Test tunnel throughput:**
```bash
# Install iperf3 on both VPS and Pi
sudo apt install iperf3

# On Pi Hub (server mode)
iperf3 -s

# On VPS (client mode)
iperf3 -c <PI_WIREGUARD_IP> -t 30 -P 4
```

**Test web response times:**
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test a service
ab -n 1000 -c 10 https://your-service.yourdomain.com/
```

**Monitor with curl:**
```bash
# Detailed timing breakdown
curl -w "\n\nDNS: %{time_namelookup}s\nConnect: %{time_connect}s\nTLS: %{time_appconnect}s\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" \
  -o /dev/null -s https://your-service.yourdomain.com/
```

### 3. Grafana Dashboard (Advanced)

**Deploy monitoring stack:**
```yaml
# docker-compose.yml for monitoring
version: '3'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=secure_password
```

---

## 🔧 Troubleshooting

### High Latency Issues

**Symptom:** Ping times >50ms through tunnel

**Diagnosis:**
```bash
# Check each hop
ping <VPS_PUBLIC_IP>          # Client → VPS
ping <PI_WIREGUARD_IP>        # VPS → Pi (through tunnel)
ping <NAS_LOCAL_IP>           # Pi → NAS

# Check Wireguard stats
sudo wg show
```

**Solutions:**
- Verify MTU settings (see [MTU Optimization](#1-mtu-optimization))
- Check for packet loss: `mtr <destination>`
- Ensure CPU governor is set to "performance"
- Verify Wireguard is using kernel module

### Low Throughput

**Symptom:** Download speeds <50 Mbps through tunnel

**Diagnosis:**
```bash
# Test with iperf3
iperf3 -c <PI_IP> -R  # Reverse test (download)
iperf3 -c <PI_IP>     # Upload test
```

**Solutions:**
- Check network interface speeds: `ethtool eth0`
- Verify Pi 5 is connected via Gigabit Ethernet
- Check Docker network MTU: `docker network inspect bridge`
- Monitor CPU usage during transfer: `htop`

### Connection Timeouts

**Symptom:** Services randomly timeout or disconnect

**Solutions:**
```bash
# Increase connection tracking
sudo sysctl -w net.netfilter.nf_conntrack_max=262144

# Reduce FIN timeout
sudo sysctl -w net.ipv4.tcp_fin_timeout=30

# Enable TCP keepalive
sudo sysctl -w net.ipv4.tcp_keepalive_time=60
sudo sysctl -w net.ipv4.tcp_keepalive_intvl=10
sudo sysctl -w net.ipv4.tcp_keepalive_probes=6
```

### SSL Handshake Delays

**Symptom:** Initial page loads are slow, but subsequent loads are fast

**Solutions:**
- Enable TLS session resumption in Traefik
- Use OCSP stapling
- Increase Traefik's SSL session cache

**In Traefik config:**
```yaml
tls:
  options:
    default:
      sniStrict: false
      minVersion: VersionTLS12
```

---

## ✅ Performance Checklist

After optimization, verify these settings:

**VPS:**
- [ ] UFW configured with optimized limits
- [ ] BBR congestion control enabled
- [ ] MTU set to 1440 on Wireguard interface
- [ ] CrowdSec log level set to "info"
- [ ] Traefik timeouts configured

**Pi Hub:**
- [ ] CPU governor set to "performance"
- [ ] PCIe Gen 3 enabled for NVMe
- [ ] MTU set to 1440 on Wireguard interface
- [ ] Pangolin workers = CPU cores
- [ ] Memory buffers optimized

**Wireguard:**
- [ ] PersistentKeepalive = 25
- [ ] Kernel module loaded (not userspace)
- [ ] MTU optimized on both ends

**NAS:**
- [ ] PostgreSQL tuned for available RAM
- [ ] Redis maxmemory policy set
- [ ] Docker daemon optimized

---

## 📚 Additional Resources

**Performance Testing:**
- [iperf3 Documentation](https://iperf.fr/)
- [Wireguard Performance Guide](https://www.wireguard.com/performance/)
- [BBR Congestion Control](https://cloud.google.com/blog/products/networking/tcp-bbr-congestion-control-comes-to-gcp-your-internet-just-got-faster)

**Traefik Optimization:**
- [Traefik Performance Tips](https://doc.traefik.io/traefik/getting-started/performance/)
- [HTTP/2 Optimization](https://blog.cloudflare.com/http-2-prioritization-with-nginx/)

**Linux Network Tuning:**
- [Linux Network Tuning Guide](https://www.kernel.org/doc/Documentation/networking/ip-sysctl.txt)
- [TCP Tuning for Linux](https://www.cyberciti.biz/faq/linux-tcp-tuning/)

---

**Performance tuning is iterative.** Start with the baseline measurements, apply optimizations one at a time, and measure the impact. Focus on the bottlenecks first (usually network or CPU).

For most homelab setups, the optimizations in the **Network Optimization** and **Raspberry Pi 5 Optimization** sections will provide the biggest improvements.

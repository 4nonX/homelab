# Docker Infrastructure & Best Practices

Comprehensive Docker deployment strategy, container orchestration, and operational best practices for the homelab.

## 🐳 Docker Environment

### Platform Details
- **Docker Version:** Latest (managed by ZimaOS)
- **Docker Compose:** Version 2.x
- **Container Runtime:** containerd
- **Total Containers:** 40+ active containers
- **Orchestration:** Docker Compose (stack-based deployment)

### Deployment Strategy

**Stack-Based Organization:**
```
docker-compose/
├── media/
│   ├── arr-stack.yml           # Sonarr, Radarr, Lidarr, Prowlarr
│   └── media-servers.yml        # Emby, SwingMusic
├── productivity/
│   ├── nextcloud-stack.yml      # Nextcloud + DB + Redis
│   ├── immich-stack.yml         # Immich + ML + DB
│   └── notes-stack.yml          # Joplin, Memos
├── infrastructure/
│   ├── dns-stack.yml            # Pi-hole
│   ├── management.yml           # Dockge, Syncthing
│   └── monitoring.yml           # Future: Prometheus, Grafana
└── security/
    └── vaultwarden.yml          # Password manager
```

## 📦 Container Management

### Image Strategy

**Source Priority:**
1. **Official Images:** Docker Hub official images
2. **LinuxServer.io:** Trusted community images
3. **GHCR (GitHub Container Registry):** Open-source projects
4. **Verified Publishers:** Established vendors

**Image Selection Criteria:**
- Regular updates and maintenance
- Security patch history
- Community adoption
- Documentation quality
- Multi-architecture support

**Version Pinning:**
```yaml
# Good: Specific version
image: postgres:14.2

# Better: Minor version pin
image: postgres:14

# Avoid: Latest tag (unpredictable updates)
image: postgres:latest
```

### Network Architecture

**Network Types Used:**
- **Bridge Networks:** Default for most containers
- **Host Networks:** Select services (Pi-hole, performance-critical)
- **Overlay Networks:** Future multi-host deployment
- **Macvlan Networks:** Considered for network isolation

**Network Segmentation:**

```yaml
# Media Stack Network
media-network:
  driver: bridge
  ipam:
    config:
      - subnet: 172.20.0.0/16

# VPN-Routed Network
gluetun-network:
  driver: bridge
  ipam:
    config:
      - subnet: 172.23.0.0/16
```

**Inter-Container Communication:**
- Service discovery via DNS (container names)
- Network aliases for flexibility
- Explicit network attachments (no default bridge)

### Volume Management

**Volume Types:**
1. **Named Volumes:** Database data, critical configs
2. **Bind Mounts:** Configuration files, media libraries
3. **Tmpfs Mounts:** Temporary data, caches

**Volume Strategy:**
```yaml
volumes:
  # Named volume for database
  postgres_data:
    driver: local

  # Bind mount for media access
  - /DATA/media:/media:ro

  # Config directory
  - /DATA/appdata/service:/config
```

**Storage Paths:**
```
/DATA/
├── appdata/              # Container configurations
│   ├── sonarr/
│   ├── radarr/
│   ├── nextcloud/
│   └── [service-name]/
├── media/                # Media storage
│   ├── tv/
│   ├── movies/
│   └── music/
├── backups/              # Local backups
```

## 🔒 Security Best Practices

### Container Security

**1. User Permissions:**
```yaml
services:
  service:
    user: "1000:1000"  # Run as non-root
    security_opt:
      - no-new-privileges:true
```

**2. Read-Only Root Filesystem:**
```yaml
services:
  service:
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

**3. Resource Limits:**
```yaml
services:
  service:
    mem_limit: 2g
    cpus: 2.0
    pids_limit: 100
```

**4. Capability Dropping:**
```yaml
services:
  service:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Only when needed
```

### Secrets Management

**Environment Variables:**
```yaml
# Non-sensitive configs
environment:
  - PUID=1000
  - PGID=1000
  - TZ=Europe/Berlin

# Sensitive data via secrets
secrets:
  - db_password
  - api_key
```

**Docker Secrets:**
```yaml
secrets:
  db_password:
    file: /path/to/password.txt
  api_key:
    external: true
```

### Network Security

**Firewall Integration:**
- UFW rules for Docker published ports
- Deny by default, allow explicitly
- No automatic bridge network usage

**Isolation Strategy:**
- Database containers: No external network access
- VPN-routed containers: Gluetun network only
- Public services: Behind reverse proxy only

## 📊 Monitoring & Logging

### Container Health Checks

**Example Health Check:**
```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Health Check Best Practices:**
- Lightweight checks (avoid heavy operations)
- Appropriate intervals (not too frequent)
- Realistic retry counts
- Start period for slow-starting services

### Logging Configuration

**Docker Logging:**
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**Log Rotation:**
- Max size: 10 MB per log file
- Keep last 3 files
- Total retention: ~30 MB per container

**Centralized Logging (Planned):**
- Loki for log aggregation
- Promtail for log shipping
- Grafana for visualization

### Resource Monitoring

**Current Monitoring:**
```bash
# Docker stats
docker stats

# Container inspection
docker inspect [container]

# System-wide monitoring
htop
```

**Planned Monitoring Stack:**
- **cAdvisor:** Container metrics
- **Prometheus:** Metrics storage
- **Grafana:** Dashboards and alerting
- **Node Exporter:** Host metrics

## 🔄 Update & Maintenance

### Update Strategy

**Manual Updates:**
```bash
# Update specific stack
cd /path/to/stack
docker-compose pull
docker-compose up -d

# Update all containers
docker-compose -f compose1.yml -f compose2.yml pull
docker-compose -f compose1.yml -f compose2.yml up -d
```

**Automated Updates (Watchtower):**
```yaml
services:
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_SCHEDULE=0 0 2 * * SUN  # Sunday 2 AM
      - WATCHTOWER_NOTIFICATIONS=email
```

**Update Safety:**
- Pre-update backups (BTRFS snapshots if configured)
- Version pinning for critical services
- Staged rollout for testing
- Automated rollback on health check failure

### Backup Strategy

**Configuration Backup:**
```bash
# Backup docker compose files
tar -czf docker-configs-$(date +%Y%m%d).tar.gz \
  /path/to/docker-compose/

# Backup container volumes
docker run --rm \
  -v volume_name:/volume \
  -v $(pwd):/backup \
  alpine tar czf /backup/volume-backup.tar.gz -C /volume .
```

**Database Backups:**
```bash
# PostgreSQL backup
docker exec postgres pg_dumpall -U postgres | \
  gzip > backup-$(date +%Y%m%d).sql.gz

# Automated via cron
0 3 * * * /scripts/backup-databases.sh
```

## 🚀 Deployment Workflow

### New Service Deployment

**1. Planning Phase:**
- Review service documentation
- Plan resource allocation
- Identify dependencies
- Choose network placement

**2. Compose File Creation:**
```yaml
version: '3.8'

services:
  service_name:
    image: vendor/image:tag
    container_name: service_name
    restart: unless-stopped
    networks:
      - service_network
    volumes:
      - config:/config
      - data:/data
    environment:
      - VAR=value
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s

networks:
  service_network:
    driver: bridge

volumes:
  config:
  data:
```

**3. Testing:**
- Deploy in test environment
- Verify functionality
- Check resource usage
- Review logs for errors

**4. Production Deployment:**
```bash
# Deploy stack
docker-compose up -d

# Verify deployment
docker-compose ps
docker-compose logs -f

# Test service
curl http://localhost:port/health
```

### Troubleshooting

**Common Issues:**

**Container Won't Start:**
```bash
# Check logs
docker logs container_name

# Inspect container
docker inspect container_name

# Verify volumes
docker volume ls
docker volume inspect volume_name
```

**Network Issues:**
```bash
# Check networks
docker network ls
docker network inspect network_name

# Test connectivity
docker exec container ping other_container
```

**Resource Constraints:**
```bash
# Check resource usage
docker stats

# Inspect resource limits
docker inspect container_name | grep -A 10 "Memory"
```

## 📈 Performance Optimization

### Resource Allocation

**CPU Allocation:**
- Critical services: 2+ cores
- Standard services: 1 core
- Background tasks: 0.5 cores

**Memory Allocation:**
- Heavy services (Immich): 4 GB
- Medium services (Nextcloud): 2 GB
- Light services: 512 MB
- Total: ~15 GB allocated, ~20 GB available

**Disk I/O:**
- Database containers: Prioritized I/O
- Download services: Normal priority
- Background tasks: Lower priority

### Optimization Techniques

**1. Layer Caching:**
- Minimal layer count
- Proper layer ordering
- Cache-friendly builds

**2. Multi-Stage Builds:**
```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
COPY --from=builder /app/dist /app
CMD ["node", "server.js"]
```

**3. Resource Scheduling:**
- Stagger resource-intensive tasks
- Run backups during low-usage periods
- Schedule updates off-peak

## 🔮 Future Enhancements

### Planned Improvements

**1. Kubernetes Migration (Long-term):**
- Evaluate K3s or MicroK8s
- High availability setup
- Automated scaling
- Advanced orchestration

**2. CI/CD Pipeline:**
- Automated testing
- Deployment automation
- Rollback procedures
- Version control integration

**3. Advanced Monitoring:**
- Distributed tracing
- APM (Application Performance Monitoring)
- Predictive alerting
- Capacity planning automation

**4. Security Enhancements:**
- Container image scanning
- Runtime security monitoring
- Automated vulnerability patching
- Security policy enforcement

---

**Docker Philosophy:**
- ✅ Immutable infrastructure
- ✅ Configuration as code
- ✅ Fail fast, recover faster
- ✅ Monitor everything
- ✅ Automate repetitive tasks

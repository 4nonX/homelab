# Productivity & Self-Hosted Services

Comprehensive suite of self-hosted productivity tools replacing cloud services with local, privacy-focused alternatives.

## 🗂️ Service Categories

### Cloud Storage & File Management

**Nextcloud**
- Version: Latest
- Features:
  - File sync and share
  - Calendar and contacts
  - Collaborative document editing
  - Mobile apps supported
- Stack:
  - PostgreSQL 14 (database)
  - Redis (caching)
  - PHP-FPM with opcache
- Storage: Persistent volumes on BTRFS RAID5

### Photo Management

**Immich**
- Google Photos alternative
- Features:
  - AI-powered photo organization
  - Facial recognition
  - Mobile auto-upload
  - Timeline view
  - Sharing albums
- Stack:
  - Immich Server (v2.1.0)
  - Machine Learning container (TensorFlow)
  - PostgreSQL 14 with pgvecto.rs extension
  - Redis 6.2 (job queue)
- Hardware acceleration: Enabled for ML workloads

### Document Management

**Paperless-NGX**
- OCR document management system
- Features:
  - Automatic document scanning and OCR
  - Full-text search
  - Tag and metadata management
  - Email consumption
  - Document versioning
- Stack:
  - Paperless-NGX (main application)
  - Tika (document parsing)
  - Gotenberg (PDF generation)
  - PostgreSQL (database)
  - Redis (task queue)

### Password Management

**Vaultwarden**
- Bitwarden-compatible server
- Features:
  - End-to-end encryption
  - Browser extensions supported
  - Mobile apps compatible
  - Organization sharing
  - 2FA/TOTP support
- Lightweight alternative to official Bitwarden
- Backup: Automated encrypted backups

### Note-Taking

**Joplin Server**
- Self-hosted sync server for Joplin
- Features:
  - End-to-end encryption
  - Multi-device sync
  - Markdown support
  - Attachment handling
- Stack:
  - Joplin Server 3.5.1
  - PostgreSQL 14.2
- Desktop/mobile clients supported

**Memos**
- Lightweight note-taking service
- Features:
  - Quick note capture
  - Markdown support
  - Tag organization
  - API access
  - Minimal resource usage

### Bookmarks & Reading

**Linkwarden**
- Bookmark manager with archival
- Features:
  - Full-page archival
  - Tag organization
  - Collaboration features
  - Search functionality
- Stack:
  - Linkwarden v2.13.1
  - PostgreSQL (database)

### Calendar & Scheduling

**Cal.com**
- Open-source Calendly alternative
- Features:
  - Meeting scheduling
  - Calendar integration
  - Booking workflows
  - Team scheduling
- Stack:
  - Cal.com (latest)
  - PostgreSQL 16.1

### Reading & Media

**Kavita**
- eBook and manga server
- Features:
  - EPUB, PDF, CBZ/CBR support
  - Reading progress tracking
  - Library organization
  - Responsive web reader
- Storage: Organized by series/authors

**Audiobookshelf**
- Audiobook and podcast server
- Features:
  - Chapter support
  - Progress tracking
  - Mobile apps
  - Metadata management

## 🔐 Security Architecture

### Authentication
- **Single Sign-On:** Considered for future implementation
- **2FA:** Enabled on all services supporting it
- **HTTPS:** Enforced via reverse proxy
- **Access Control:** Service-level permissions configured

### Data Protection
- **Encryption at Rest
- **Filesystem:** BTRFS checksumming and CoW integrity
- **Encryption in Transit:** TLS 1.3 for all external access
- **Backup Encryption:** All backups encrypted with GPG
- **Password Storage:** All services use secure hashing (bcrypt/Argon2)

### Network Isolation
- Services run in isolated Docker networks
- Database containers not exposed to external networks
- Redis instances only accessible by parent services

## 📊 Database Management

### PostgreSQL Instances
1. **Nextcloud DB** (postgres:14)
2. **Immich DB** (postgres:14-vectorchord0.3.0)
3. **Joplin DB** (postgres:14.2)
4. **Cal.com DB** (postgres:16.1)
5. **Linkwarden DB** (postgres:latest)
6. **Paperless-NGX DB** (postgres:latest)

### Redis Instances
1. **Nextcloud Cache**
2. **Immich Queue**
3. **Paperless-NGX Queue**

## 💾 Backup Strategy

### Service Data
- **Frequency:** Daily incremental, weekly full
- **Retention:** 30 daily, 12 weekly, 12 monthly
- **Method:** Automated scripts + BTRFS snapshots
- **Storage:** Local + offsite replication

### Database Backups
- **Method:** pg_dump for PostgreSQL
- **Frequency:** Daily at 3 AM
- **Encryption:** GPG encrypted
- **Testing:** Monthly restore tests

### Configuration Backups
- **Docker Compose files:** Version controlled
- **Application configs:** Daily snapshots
- **Environment files:** Encrypted backup

## 📈 Resource Allocation

| Service | RAM | CPU | Storage |
|---------|-----|-----|---------|
| Nextcloud | 2 GB | 2 cores | 50 GB |
| Immich | 4 GB | 4 cores | 200 GB+ |
| Paperless-NGX | 1 GB | 2 cores | 20 GB |
| Vaultwarden | 256 MB | 0.5 core | 1 GB |
| Other Services | 512 MB each | 1 core | 5 GB each |

**Total:** ~10 GB RAM, ~15 CPU cores (burst), 300+ GB storage

## 🔄 Service Updates

- **Strategy:** Automated updates via Watchtower
- **Schedule:** Weekly on Sundays at 2 AM
- **Testing:** Staging environment for critical services
- **Rollback:** Automated via Docker tags + BTRFS snapshots

## 🌐 Access Methods

### Internal Access
- Direct IP:Port access on local network
- DNS resolution via Pi-hole

### External Access
- Reverse proxy with HTTPS
- Wireguard VPN for secure remote access
- Selective service exposure

## 📱 Mobile Integration

| Service | Mobile App | Status |
|---------|------------|--------|
| Nextcloud | Official | ✅ Configured |
| Immich | Official | ✅ Active |
| Joplin | Official | ✅ Syncing |
| Vaultwarden | Bitwarden | ✅ Active |
| Paperless-NGX | Web App | ✅ Responsive |

## 🔧 Maintenance Tasks

### Daily
- Health check monitoring
- Log review (automated)
- Backup verification

### Weekly
- Service updates (automated)
- Storage usage review
- Performance metrics

### Monthly
- Restore testing
- Security audit
- Configuration review

---

**Benefits:**
- ✅ Full data ownership and privacy
- ✅ No subscription costs
- ✅ Customizable workflows
- ✅ Local network performance
- ✅ No vendor lock-in

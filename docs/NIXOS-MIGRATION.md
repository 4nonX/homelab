# NixOS Migration Plan

I'm moving the whole homelab from ZimaOS (Debian-based) to NixOS. This covers 40+ services and about 33TB of data. The goal is to get everything running on NixOS without any major downtime for the important bits.

**Timeline:** Q1-Q2 2026  
**Status:** Planning & Testing  

---

## Why I'm doing this

1. **Declarative Config:** Right now, I have to remember all the manual `apt` commands and config tweaks I've made. With NixOS, the whole system is defined in one place (`configuration.nix`).
2. **Atomic Rollbacks:** If I break something with an update, I can just boot into the previous working version. Much safer for testing stuff.
3. **Reproducibility:** I want to be able to rebuild the exact same system on new hardware without any guesswork.

---

## 📊 Technical Drivers

### Current Stack Analysis

**ZimaOS (Debian-based) Limitations:**

| Issue | Impact | Frequency |
|-------|--------|-----------|
| **Imperative Configuration** | Manual steps not documented | Every update |
| **No Atomic Rollbacks** | Risky updates, potential breakage | Monthly |
| **System State Drift** | "Works on my machine" issues | Ongoing |
| **Difficult Reproducibility** | Can't rebuild exact system | DR scenarios |
| **Package Dependency Hell** | Conflicts during upgrades | Quarterly |

**NixOS Benefits:**

| Feature | Benefit | Value |
|---------|---------|-------|
| **Declarative Config** | Entire system in version control | High |
| **Atomic Operations** | Rollback in seconds | Critical |
| **Reproducible Builds** | Rebuild exact system state | High |
| **Isolated Packages** | No dependency conflicts | Medium |
| **Multiple Generations** | Keep working system snapshots | High |

---

## The Plan

I'm doing this in phases so I don't break everything at once.

**Key Principles:**
- Test in a VM first.
- Move small, unimportant services first.
- Always have a way to boot back into ZimaOS if things go sideways.
- Check data integrity at every step.

---

### Phase 0: Preparation & Testing (Weeks 1-2)

**Objectives:**
- Set up NixOS test environment
- Learn Nix language and module system
- Test Docker/Podman compatibility
- Validate ZFS support and D-PlaneOS integration on NixOS

**Tasks:**
- [x] Research NixOS architecture and best practices
- [ ] Install NixOS on separate test hardware
- [ ] Configure basic system (network, storage, users)
- [ ] Test Docker vs Podman for container workloads
- [ ] Test ZFS pool setup on NixOS - evaluate D-PlaneOS integration
- [ ] Document initial configuration patterns

**Success Criteria:**
- NixOS boots and runs stably on test hardware
- Can deploy at least 3 test containers
- ZFS pool creates and mounts correctly
- Configuration documented in git

**Rollback:** N/A (isolated test environment)

---

### Phase 1: Non-Critical Services (Weeks 3-4)

**Services to Migrate:**
- Uptime-Kuma (monitoring)
- Stirling-PDF (PDF tools)
- Memos (quick notes)
- Linkwarden (bookmarks)
- SwingMusic (music player)

**Why These First:**
- Low user impact if downtime occurs
- Simple configurations
- No critical data dependencies
- Good learning opportunities

**Migration Steps:**
1. Document current Docker Compose configurations
2. Convert to NixOS container definitions
3. Test on separate hardware
4. Schedule migration window (announce to users: me 😄)
5. Deploy to production NixOS
6. Validate functionality
7. Monitor for 48 hours before next phase

**Rollback Strategy:**
- Keep ZimaOS system bootable
- DNS/proxy still points to old system
- Can switch back in < 5 minutes

**Success Criteria:**
- All 5 services running on NixOS
- Accessible via same URLs
- No data loss
- Performance equal or better than before

---

### Phase 2: Media Stack (Weeks 5-6)

**Services to Migrate:**
- Gluetun (VPN gateway)
- qBittorrent
- Prowlarr (indexer manager)
- Sonarr, Radarr, Lidarr (automation)
- Bazarr (subtitles)
- Emby (media server)

**Migration Strategy:**
- Blue-green deployment approach
- Run both systems in parallel during testing
- Gradually shift traffic to NixOS
- Keep downloads running during migration

**Special Considerations:**
- VPN configuration critical (Gluetun)
- Download history preservation
- Media library paths must remain consistent
- Emby database migration

**Data Migration:**
- Application configs: Copy from ZimaOS
- Download history: Export/import from apps
- Emby database: Backup, restore on NixOS

**Rollback Strategy:**
- Parallel systems for 1 week
- DNS/traffic switch takes < 1 minute
- Can revert without data loss

**Success Criteria:**
- All media automation working
- Downloads continue without interruption
- Emby library accessible
- Watch history preserved

---

### Phase 3: Productivity & Cloud Services (Weeks 7-8)

**Critical Services:**
- Nextcloud (file sync/share)
- Immich (photo management)
- Paperless-NGX (document management)
- Vaultwarden (password manager)
- Joplin Server (note sync)

**Why These Are Critical:**
- Daily usage by multiple users
- Critical data storage
- Mobile app synchronization
- Zero tolerance for data loss

**Migration Strategy:**
- **Zero-downtime requirement**
- Parallel systems with data sync
- Gradual traffic shift per service
- Extended testing period (7 days)

**Special Considerations:**

**Nextcloud:**
- Database migration (PostgreSQL)
- File storage migration (33TB in Phase 4)
- App compatibility verification
- Client sync validation

**Immich:**
- Photo library migration
- ML model preservation
- Mobile app sync testing

**Vaultwarden:**
- Critical - password access
- Database backup mandatory
- Extensive testing before switch
- Browser extension compatibility

**Rollback Strategy:**
- Immediate failback capability
- Database replication for critical services
- No data sync gap > 5 minutes

**Success Criteria:**
- All services accessible
- Data integrity verified (checksums)
- Mobile apps sync correctly
- No user complaints for 7 days

---

### Phase 4: Infrastructure & Storage (Weeks 9-10)

**Components:**
- ZFS RAID-Z2 pool (33TB - replacing BTRFS RAID5)
- Traefik (reverse proxy)
- PostgreSQL databases (8 instances)
- Redis instances (3)
- Network configuration
- Backup systems

**Why This Is Last:**
- All services depend on this layer
- Highest risk of data loss
- Requires most careful planning

**Storage Migration Strategy:**

The target is ZFS RAID-Z2, managed by [D-PlaneOS](https://github.com/4nonX/D-PlaneOS). An in-place conversion from BTRFS to ZFS is not possible - the array must be rebuilt. The data must leave the drives before ZFS can claim them.

**Plan:**
1. Boot NixOS from NVMe — ZimaOS remains bootable on its own partition as fallback
2. Generate `sha256sum` manifest of all data on the BTRFS array (pre-migration baseline)
3. Rsync all 33TB to external/temporary storage (estimated 24-48h at HDD speeds)
4. Take a final BTRFS snapshot; note the timestamp
5. Destroy the mdadm array, create ZFS RAID-Z2 pool via D-PlaneOS
6. Configure datasets (`mainpool/appdata`, `mainpool/media`, `mainpool/home`) with appropriate properties
7. Rsync data back from temporary storage
8. Verify checksums against pre-migration manifest
9. Bring services up on NixOS, validate for 48h before decommissioning ZimaOS boot

**Database Migration:**
- Take PostgreSQL dumps as safety net before any destructive operation
- ZFS snapshot immediately before each database port
- Test restore from dump before proceeding
- Verify application connectivity before moving to next service

**Rollback Strategy:**
- ZimaOS remains bootable until Step 9
- BTRFS array intact until Step 5 — can abort at any point before that
- Rollback time to ZimaOS: < 5 minutes (boot selection)

**Success Criteria:**
- All 33TB data accessible on ZFS pool
- Checksums match pre-migration manifest
- All databases operational
- Services connect to correct dataset mount points
- `zpool status` reports clean pool with no errors

---

## ⚠️ Risk Assessment & Mitigation

### Critical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Data Loss (33TB)** | Low | Catastrophic | Pre-migration checksum manifest + offsite copy + ZimaOS fallback |
| **Extended Downtime** | Medium | High | Phased approach + rollback plans + parallel systems |
| **Configuration Errors** | High | Medium | Test environment first + incremental changes + documentation |
| **Service Incompatibility** | Low | Medium | Pre-test all services on NixOS + compatibility matrix |
| **Network Connectivity Loss** | Low | High | Keep ZimaOS bootable + physical access available |
| **Data corruption during rsync** | Low | High | Checksum verification before and after; abort-and-retry if mismatch |
| **User Access Issues** | Medium | Low | Gradual rollout + rollback ready |

### Risk Mitigation Checklist

**Before Starting ANY Phase:**
- [ ] Full backup of all data (offsite)
- [ ] Test rollback procedure
- [ ] Document current working state
- [ ] Announce maintenance window (if applicable)
- [ ] Verify backup restore capability

**During Migration:**
- [ ] Take snapshots before each major change
- [ ] Verify checksums after data moves
- [ ] Keep detailed migration log
- [ ] Test services immediately after migration
- [ ] Monitor for errors continuously

**After Each Phase:**
- [ ] Full functionality test
- [ ] User acceptance test (me)
- [ ] Monitor for 24-48 hours
- [ ] Document lessons learned
- [ ] Plan adjustments for next phase

---

## 🧪 Testing Environment

### Hardware Setup

**Test Server:**
- CPU: Intel i5 (older generation)
- RAM: 16GB
- Storage: 500GB SSD (limited, enough for testing)
- Network: 1Gbps

**Test Scope:**
- NixOS installation and basic configuration
- Container deployment (Docker/Podman)
- ZFS pool creation and dataset management via D-PlaneOS
- Service configurations
- Backup/restore procedures

### Test Scenarios

**Completed:**
- [x] Basic NixOS installation research
- [x] Documentation review
- [x] Community resources identification

**In Progress:**
- [ ] NixOS installation on VM
- [ ] Basic system configuration
- [ ] Docker vs Podman evaluation

**Planned:**
- [ ] Container service deployment
- [ ] ZFS pool setup and D-PlaneOS integration testing
- [ ] Network configuration
- [ ] Traefik setup
- [ ] Database deployment
- [ ] Backup/restore validation
- [ ] Performance benchmarking

---

## 📝 NixOS Configuration Strategy

### Configuration Structure
```
/etc/nixos/
├── configuration.nix              # Main system configuration
├── hardware-configuration.nix     # Auto-generated hardware config
├── modules/
│   ├── system/
│   │   ├── boot.nix              # Boot loader settings
│   │   ├── networking.nix        # Network configuration
│   │   └── users.nix             # User management
│   ├── storage/
│   │   ├── zfs.nix               # ZFS pool + dataset configuration (see D-PlaneOS)
│   │   └── backups.nix           # Snapshot and replication schedules
│   ├── containers/
│   │   ├── docker.nix            # Docker/Podman setup
│   │   └── podman.nix
│   └── services/
│       ├── traefik.nix           # Reverse proxy
│       ├── databases.nix         # PostgreSQL + Redis
│       ├── media-stack.nix       # Media services
│       ├── productivity.nix      # Cloud services
│       └── monitoring.nix        # Monitoring stack
├── secrets/                       # Encrypted secrets (age/sops)
│   └── .gitignore
└── flake.nix                      # Flakes for reproducibility
```

### Configuration Management Approach

**Version Control:**
- Git repository for all configurations
- Separate branch for testing vs production
- Commit before each major change
- Tag each stable generation

**Secrets Management:**
- Use age or sops-nix for secrets
- Never commit secrets in plaintext
- Separate secrets repo (private)

**Modularity:**
- Each major component = separate module
- Reusable patterns across services
- Easy to enable/disable components

---

## 📊 Success Metrics

### Technical Metrics

- [ ] **Zero Data Loss:** Checksums verified for all 33TB
- [ ] **Uptime Target:** < 4 hours total downtime for critical services
- [ ] **Service Availability:** All 40+ services operational on NixOS
- [ ] **Rollback Test:** Successfully rolled back at least once per phase
- [ ] **Performance:** Equal or better than ZimaOS baseline
- [ ] **Configuration:** All services defined declaratively

### Documentation Metrics

- [ ] **Migration Log:** Daily updates during active migration
- [ ] **Configuration Docs:** All NixOS configs documented
- [ ] **Lessons Learned:** Post-phase retrospectives
- [ ] **Troubleshooting Guide:** Common issues + solutions
- [ ] **Rollback Procedures:** Tested and documented

### Learning Metrics

- [ ] **Nix Language:** Comfortable writing Nix expressions
- [ ] **NixOS Modules:** Can create custom modules
- [ ] **Flakes:** Understand and use flakes for reproducibility
- [ ] **Debugging:** Can troubleshoot NixOS-specific issues

---

## 📚 Learning Resources

### Primary Resources

**Official Documentation:**
- [NixOS Manual](https://nixos.org/manual/nixos/stable/) - Comprehensive reference
- [Nix Pills](https://nixos.org/guides/nix-pills/) - Deep dive into Nix concepts
- [Nixpkgs Manual](https://nixos.org/manual/nixpkgs/stable/) - Package collection docs

**Community:**
- [NixOS Discourse](https://discourse.nixos.org/) - Community forum
- [NixOS Wiki](https://nixos.wiki/) - Community-maintained wiki
- [r/NixOS](https://reddit.com/r/NixOS) - Reddit community

**Learning Path:**
1. Nix language fundamentals
2. NixOS module system
3. Flakes for reproducibility
4. Custom package derivations
5. Advanced configuration patterns

### Inspirational Configs

**GitHub Repositories:**
- Search: "nixos homelab" for similar projects
- Study: How others structure their configs
- Learn: Common patterns and best practices

---

## 📅 Tentative Timeline

| Phase | Duration | Start | End | Status |
|-------|----------|-------|-----|--------|
| **Phase 0: Preparation** | 2 weeks | Week 1 | Week 2 | 🟡 In Progress |
| **Phase 1: Non-Critical** | 2 weeks | Week 3 | Week 4 | ⏳ Planned |
| **Phase 2: Media Stack** | 2 weeks | Week 5 | Week 6 | ⏳ Planned |
| **Phase 3: Critical Services** | 2 weeks | Week 7 | Week 8 | ⏳ Planned |
| **Phase 4: Infrastructure** | 2 weeks | Week 9 | Week 10 | ⏳ Planned |
| **Stabilization & Documentation** | 2 weeks | Week 11 | Week 12 | ⏳ Planned |

**Total Estimated Duration:** 10-12 weeks  
**Target Completion:** Q1-Q2 2025  
**Buffer:** 2-4 weeks for unexpected issues

---

## Migration Log

Keep track of what's actually happening here.

**Phase 0: Preparation (Current)**

- [2025-01-07] Started the plan.
- [ ] Set up test environment.
- [ ] First NixOS install on test hardware.

# 🚀 NixOS Migration Project

## Executive Summary

Complete production infrastructure migration from ZimaOS (Debian-based) to NixOS, encompassing 40+ containerized services and 33TB storage, with zero-downtime target for critical services.

**Timeline:** Q1-Q2 2026  
**Current Phase:** Planning & Testing  
**Complexity:** High (Production environment, 2+ years uptime, ~95% SLA)  
**Public Documentation:** [github.com/4nonX/homelab](https://github.com/4nonX/homelab)

---

## 🎯 Project Goals

### Primary Objectives

1. **Declarative Infrastructure at OS Level**
   - Current: Imperative configuration (apt, manual config files)
   - Target: Entire system defined in `configuration.nix`
   - Benefit: System reproducibility, version control for OS configuration

2. **Improved Reliability & Safety**
   - Current: Manual rollback on failed updates (risky, time-consuming)
   - Target: Atomic rollbacks - boot into previous generation
   - Benefit: Safe experimentation, faster disaster recovery

3. **Modern DevOps Practices**
   - Current: Infrastructure as Code only for containers (Docker Compose)
   - Target: IaC for entire system stack (OS + containers + services)
   - Benefit: True reproducible environments, portable configurations

4. **Simplified Maintenance**
   - Current: Configuration drift, manual dependency management
   - Target: Declarative dependencies, no configuration drift
   - Benefit: Reduced maintenance burden, consistent environments

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

## 🗺️ Migration Strategy

### Overview

**Approach:** Phased migration with incremental validation and rollback capability at each step.

**Key Principles:**
- ✅ Test everything in isolated environment first
- ✅ Migrate non-critical services before critical ones
- ✅ Maintain rollback capability at every phase
- ✅ Document everything during (not after) migration
- ✅ Validate data integrity at each step

---

### Phase 0: Preparation & Testing (Weeks 1-2)

**Objectives:**
- Set up NixOS test environment
- Learn Nix language and module system
- Test Docker/Podman compatibility
- Validate BTRFS support on NixOS

**Tasks:**
- [x] Research NixOS architecture and best practices
- [ ] Install NixOS on separate test hardware
- [ ] Configure basic system (network, storage, users)
- [ ] Test Docker vs Podman for container workloads
- [ ] Test BTRFS RAID5 setup on NixOS
- [ ] Document initial configuration patterns

**Success Criteria:**
- NixOS boots and runs stably on test hardware
- Can deploy at least 3 test containers
- BTRFS performance acceptable
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
- BTRFS RAID5 (33TB)
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

**Option A: In-Place Migration (Lower Risk)**
1. Install NixOS on separate drive
2. Mount existing BTRFS RAID5 array
3. Verify data integrity (checksums)
4. Keep ZimaOS bootable as backup

**Option B: Fresh Array (Higher Safety)**
1. Build new BTRFS array on NixOS
2. Rsync data from ZimaOS (33TB = ~24h)
3. Verify checksums
4. Keep old array for 2 weeks

**Decision:** Option A (in-place) - Less time, BTRFS snapshots provide safety

**Database Migration:**
- Take snapshots before migration
- Export dumps as safety net
- Test restore procedures
- Verify application connectivity

**Rollback Strategy:**
- BTRFS snapshot before migration
- Rollback time: < 10 minutes
- Boot back to ZimaOS if needed
- Data integrity guaranteed

**Success Criteria:**
- All 33TB data accessible
- Checksums match pre-migration
- All databases operational
- Services connect successfully
- Backup system functional

---

## ⚠️ Risk Assessment & Mitigation

### Critical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Data Loss (33TB)** | Low | Catastrophic | BTRFS snapshots + offsite backup + checksum verification |
| **Extended Downtime** | Medium | High | Phased approach + rollback plans + parallel systems |
| **Configuration Errors** | High | Medium | Test environment first + incremental changes + documentation |
| **Service Incompatibility** | Low | Medium | Pre-test all services on NixOS + compatibility matrix |
| **Network Connectivity Loss** | Low | High | Keep old system bootable + physical access available |
| **BTRFS Array Corruption** | Very Low | Catastrophic | Snapshots + scrub before migration + offsite backup |
| **User Access Issues** | Medium | Low | Gradual rollout + communication + rollback ready |

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
- BTRFS setup and performance
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
- [ ] BTRFS RAID testing
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
│   │   ├── btrfs.nix             # BTRFS RAID5 setup
│   │   └── backups.nix           # Backup configuration
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

## 📖 Migration Log

### Phase 0: Preparation (Current)

**Week 1:**
- [2025-01-07] Project planning and documentation started
- [2025-01-07] Created detailed migration plan
- [2025-01-07] Identified learning resources
- [ ] Set up test environment
- [ ] Install NixOS on test hardware

**Week 2:**
- [ ] Basic NixOS configuration
- [ ] Docker/Podman testing
- [ ] BTRFS performance testing
- [ ] Document initial findings

---

## 🎓 Learnings & Insights

*This section will be updated throughout the migration with key learnings, surprises, and recommendations.*

### What I'm Learning

**Technical Insights:**
- [To be updated during migration]

**Process Insights:**
- [To be updated during migration]

**Surprises:**
- [To be updated during migration]

### What Went Well

*Post-migration reflections*

### What Could Be Improved

*Post-migration reflections*

### Recommendations for Others

*Post-migration advice for similar projects*

---

## 🤝 Why I'm Documenting This Publicly

This migration project demonstrates several skills relevant to modern infrastructure and DevOps roles:

**Technical Skills:**
- **Change Management:** Planning and executing complex production changes
- **Risk Assessment:** Identifying potential issues and mitigation strategies  
- **System Architecture:** Understanding infrastructure from OS to application layer
- **Modern Practices:** Adopting Infrastructure as Code principles at OS level

**Professional Skills:**
- **Project Planning:** Breaking complex projects into manageable phases
- **Documentation:** Creating comprehensive technical documentation
- **Problem Solving:** Systematic approach to technical challenges
- **Continuous Learning:** Self-directed learning of advanced technologies

**Why Public:**
1. **Portfolio:** Demonstrates practical infrastructure engineering skills
2. **Community:** Help others considering similar migrations
3. **Accountability:** Public commitment encourages completion
4. **Feedback:** Learn from community suggestions and experiences

---

## 💬 Questions or Feedback?

If you're doing something similar, have suggestions, or want to discuss this project:

- **Open an Issue:** [github.com/4nonX/homelab/issues](https://github.com/4nonX/homelab/issues)
- **Connect:** [linkedin.com/in/dan-dressen](https://linkedin.com/in/dan-dressen)
- **Portfolio:** [github.com/4nonX](https://github.com/4nonX)

I'm happy to discuss technical approaches, share learnings, or hear about your experiences with NixOS or similar migrations.

---

## 📜 License & Usage

This documentation is shared for educational purposes. Feel free to reference or adapt for your own projects. If you find it helpful, a GitHub star ⭐ is appreciated!

---

**Last Updated:** 2025-01-07  
**Project Status:** 🟡 Phase 0 - Planning & Preparation  
**Next Milestone:** Complete test environment setup  
**Progress:** ~5% (Planning complete, execution starting)

---

*This document will be updated throughout the migration to reflect actual progress, learnings, and adjustments to the plan.*

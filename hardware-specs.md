# Hardware Specifications

Detailed hardware configuration and capabilities of the homelab server.

## 🖥️ Main Server: DIY NAS Build

### System Information
- **Build Type:** Custom DIY NAS
- **Operating System:** ZimaOS v1.5.2
- **Kernel:** Linux 6.12.25 (SMP PREEMPT_DYNAMIC)
- **Architecture:** x86_64 (64-bit)
- **Build Date:** November 26, 2025 (OS)
- **Hardware:** Self-assembled server components

### Processor (CPU)

**Model:** Intel Core i3-13100 (13th Gen Raptor Lake)

**Specifications:**
- **Cores:** 4 physical cores
- **Threads:** 8 (Hyper-Threading enabled)
- **Base Clock:** 3.3 GHz
- **Boost Clock:** Up to 4.5 GHz
- **Cache:** 
  - L1 Cache: 320 KB
  - L2 Cache: 5 MB
  - L3 Cache: 12 MB (shared)
- **TDP:** 60W (configurable down to 35W)
- **Architecture:** Raptor Lake (Intel 7 process)

**Features:**
- Intel Turbo Boost 2.0
- Intel UHD Graphics 730
- Intel Quick Sync Video (hardware transcoding)
- AES-NI (hardware encryption)
- AVX2 instruction set

**Performance Characteristics:**
- **Single-core:** Excellent for most tasks
- **Multi-core:** Handles 40+ containers efficiently
- **Power efficiency:** <60W under load
- **Thermal performance:** Stays cool under normal loads

### Memory (RAM)

**Total Memory:** 32 GB DDR4

**Configuration:**
- **Type:** DDR4 (dual-channel)
- **Speed:** ~3200 MHz
- **ECC:** Non-ECC (standard desktop RAM)

**Current Usage:**
- **Used:** ~10 GB
- **Free:** ~500 MB
- **Buff/Cache:** ~21 GB
- **Available:** ~20 GB
- **Swap:** 10 GB configured (98 MB used)

**Memory Allocation:**
```
Total: 32 GB
├─ System + ZimaOS: ~2 GB
├─ Docker Containers: ~8 GB
├─ Cache/Buffers: ~21 GB
└─ Available: ~1 GB free
```

**Container Memory Limits:**
- Average container: 256-512 MB
- Heavy containers (Immich, Nextcloud): 2-4 GB
- Database containers: 512 MB - 1 GB
- Total allocated: ~15 GB with burst capacity

### Storage Architecture

**Primary Storage:** 4x HDD in mdadm RAID5 with BTRFS

**RAID Configuration:**
- **RAID Level:** RAID5 (mdadm software RAID)
- **Total Capacity:** 33 TB
- **Used:** 3.1 TB
- **Available:** 30 TB
- **Utilization:** ~10%

**Drive Configuration:**
- 2x 12.7 TB HDDs (sda, sdd)
- 2x 10.9 TB HDDs (sdb, sdc)
- Mixed drive sizes (RAID5 uses smallest common capacity)

**Boot/System Storage:**
- **Device:** NVMe SSD (120 GB)
- **Partitions:**
  - Boot partition: 32 MB (FAT32)
  - System partitions: ~12 GB (SquashFS, read-only)
  - Overlay: 96 MB (ext4)
  - Data partition: 107 GB (ext4) - Docker & configs

**Filesystem:** BTRFS on RAID5

**BTRFS Features in Use:**
- Data and metadata RAID5
- Online filesystem shrinking/growing
- Subvolumes for organization
- Compression (likely lzo or zstd)
- Copy-on-write (CoW) for data integrity
- Checksumming for data/metadata
- Self-healing on read errors (RAID5)
- Snapshots (available but may not be heavily used)

**Storage Layout:**
```
/dev/md0 (BTRFS RAID5)
├─ /media/mainpool (33TB mounted)
   ├─ Media files
   ├─ Downloads
   └─ Backups

/dev/nvme0n1p8 (ext4)
├─ /DATA (107GB)
   ├─ Docker containers
   ├─ AppData
   └─ Configurations
```

### Network Interfaces

**Primary Interface:** Gigabit Ethernet (1 Gbps)
- **Interface:** eth0
- **Speed:** 1000 Mbps
- **Duplex:** Full
- **MTU:** 1500 (standard)

**IP Configuration:**
- **IPv4:** 10.XXX.X.X/24
- **Gateway:** 10.XXX.X.XXX
- **DNS:** 10.XXX.X.X (Pi-hole)

**Docker Networks:**
- Multiple virtual networks (bridge mode)
- Network isolation between stacks
- Host networking for select services

### Graphics & Video

**Integrated Graphics:** Intel UHD Graphics 730

**Capabilities:**
- **Maximum Resolution:** 4K @ 60Hz (DisplayPort/HDMI)
- **Display Outputs:** Multiple (DP + HDMI)
- **Hardware Encoding/Decoding:**
  - H.264 (AVC)
  - H.265 (HEVC) 
  - VP9
  - AV1 (decode only)
- **Quick Sync Video:** Gen 12.7

**Use Cases:**
- Hardware transcoding in Emby
- GPU acceleration for Immich ML workloads
- Efficient video encoding for Paperless-NGX

### Power & Thermal

**Power Supply:**
- Type: External adapter or internal PSU
- Wattage: 120W+ (estimated)
- Efficiency: 80+ rated

**Power Consumption:**
- **Idle:** ~15-25W
- **Normal Load:** ~30-50W
- **Peak Load:** ~60-80W
- **Daily Average:** ~35W (~840 Wh/day)

**Cooling:**
- Active cooling (fan-based)
- Thermal monitoring via lm-sensors
- Automatic fan curve adjustment

**Operating Temperatures:**
- CPU: 35-55°C typical, <85°C max
- Ambient: 20-30°C recommended

### Expansion & I/O

**USB Ports:** Multiple USB 3.0/3.1 ports
- Used for external drives
- Potential for UPS communication

**PCIe Slots:** (If applicable)
- Possibility for network card upgrade
- Storage controller expansion

**Drive Bays:**
- Multiple SATA bays
- Hot-swap capable (depending on model)

## 📊 Performance Benchmarks

### CPU Performance
- **Passmark Score:** ~18,000 (multi-thread)
- **Geekbench 6:**
  - Single-core: ~2,300
  - Multi-core: ~9,000
- **Real-world:** Handles 40+ containers smoothly

### Storage Performance
- **Sequential Read:** ~400-500 MB/s (RAID5, HDD-limited)
- **Sequential Write:** ~350-450 MB/s (RAID5, parity overhead)
- **Random IOPS:** ~200-300 IOPS (HDD-based RAID5)
- **BTRFS Overhead:** ~5-10% for CoW and checksumming
- **NVMe Boot Drive:** ~3000 MB/s read, ~1500 MB/s write

### Network Performance
- **LAN Throughput:** ~940 Mbps (Gigabit)
- **Docker Bridge:** ~5-10 Gbps (internal)
- **VPN Throughput:** ~300-400 Mbps (Wireguard)

### Memory Performance
- **Bandwidth:** ~40-50 GB/s (dual-channel DDR4-3200)
- **Latency:** ~70-80ns (typical DDR4)

## 🔧 Hardware Management

**Monitoring Tools:**
- `lscpu` - CPU information
- `lsmem` / `free -h` - Memory stats
- `lsblk` / `zpool status` - Storage info
- `ip addr` / `ethtool` - Network details
- `sensors` - Temperature monitoring
- `htop` / `btop` - Resource monitoring

**BIOS/UEFI Settings:**
- Intel Turbo Boost: Enabled
- Virtualization (VT-x): Enabled
- Hyper-Threading: Enabled
- Power Management: Balanced
- Wake-on-LAN: Configured

## 📈 Capacity Planning

### Current Utilization
- **CPU:** 15-30% average, 80-90% peaks (transcoding)
- **RAM:** 30-40% (10-12 GB) with 20 GB buffer/cache
- **Storage:** [To be determined]
- **Network:** <10% utilization typical

### Upgrade Path
**Near-term (optional):**
- Additional storage drives
- UPS for power redundancy
- 10GbE network card

**Long-term (future-proofing):**
- CPU upgrade (i5/i7 13th gen)
- RAM expansion to 64 GB
- Additional storage expansion
- Dedicated GPU (AI/ML workloads)

### Capacity Limits
- **Max RAM:** 64 GB
- **Max Cores:** Current platform limit
- **Storage:** Limited by available SATA ports
- **Network:** 1 Gbps (upgradeable to 10G)

## 🛠️ Maintenance

**Regular Tasks:**
- BTRFS scrub: Monthly (`btrfs scrub start /media/mainpool`)
- RAID integrity check: Monthly (`echo check > /sys/block/md0/md/sync_action`)
- SMART monitoring: Weekly
- Thermal paste: Every 2-3 years
- Dust cleaning: Every 6 months
- Firmware updates: As released

**Health Monitoring:**
- CPU temperature tracking
- Disk SMART status
- Memory error checking
- Network uptime monitoring

---

**Hardware Philosophy:**
- ✅ Balanced performance and efficiency
- ✅ Enterprise features (RAID5, BTRFS)
- ✅ Adequate for 50+ containers
- ✅ Room for growth
- ✅ Energy efficient (~30W average)

# 🛡️ Pangolin Pi-Hub: The Transparent VPS Relay Guide

[![Hardware](https://img.shields.io/badge/Hardware-Pi%205%208GB-BC1142?logo=raspberry-pi&logoColor=white)](#)
[![Storage](https://img.shields.io/badge/Storage-NVMe%20Gen4-yellow?logo=ssm&logoColor=black)](#)
[![Status](https://img.shields.io/badge/Status-16--Star--Milestone-blueviolet)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

This guide documents the "Live Transplant" of the Pangolin Server from a VPS-hosted instance to a local **Raspberry Pi 5 Hub**. By offloading the "Brain" to local NVMe hardware, we utilize the VPS as a "Dumb Pipe" for its static IP while keeping SSL keys and databases physically secure at home.

---

## 📖 Table of Contents
- [Architecture Overview](#-architecture-overview)
- [Phase 1: Hardware & OS Setup](#-phase-1-hardware--os-setup)
- [Phase 2: Network Mounting (Static IP)](#-phase-2-network-mounting-static-ip)
- [Phase 3: Installing the Pangolin Brain](#-phase-3-installing-the-pangolin-brain)
- [Phase 4: Configuring the VPS Relay](#-phase-4-configuring-the-vps-relay)
- [Phase 5: Live Cutover](#-phase-5-live-cutover)
- [Pro/Con Analysis](#-procon-analysis)

---

## 🏗️ Architecture Overview

* **The Ingress (VPS):** A public entry point that forwards traffic without decrypting it.
* **The Tunnel (Newt):** Encrypted link connecting the VPS to your home network.
* **The Brain (Pi 5):** Terminates SSL, manages Identity, and handles routing on a Gen4 NVMe SSD.

**[→ View Interactive Architecture Diagram](https://4nonx.github.io/homelab/architecture-diagram.html)**

---

## 🛠️ Phase 1: Hardware & OS Setup

### 1. Download Tools & OS
* **Imager:** [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
* **OS:** **Raspberry Pi OS Lite (64-bit)**
* **Power:** [Official 27W USB-C Power Supply](https://www.raspberrypi.com/products/27w-power-supply/) (Required for NVMe stability).

### 2. Flashing the NVMe
1. Open Imager and select **Raspberry Pi 5**.
2. Choose **Raspberry Pi OS Lite (64-bit)**.
3. Click the **Gear Icon (Edit Settings)**:
   * Set Hostname: `pangolin-hub`
   * Set Username/Password
   * **Enable SSH** (Use password or public key)
4. Write to your NVMe SSD.

### 3. Unlock PCIe Gen 3 Speeds
The Pi 5 limits PCIe to Gen 2 by default. Force Gen 3 for maximum NVMe throughput:

```bash
sudo nano /boot/firmware/config.txt
```

Add to the bottom:

```
# Enable PCIe Gen 3 speeds
dtparam=pciex1
dtparam=pciex1_gen=3
```

Reboot:

```bash
sudo reboot
```

### 4. CPU Optimization
Prevent latency spikes during intensive SSL handshakes:

```bash
sudo apt update && sudo apt install -y cpufrequtils
echo 'GOVERNOR="performance"' | sudo tee /etc/default/cpufrequtils
sudo systemctl restart cpufrequtils
```

---

## 🏠 Phase 2: Network Mounting (Static IP)

The Pi requires a permanent internal address to prevent the VPS tunnel from breaking on reboot.

* **Physical Connection:** Connect via Ethernet (Mandatory for reliability).
* **DHCP Reservation:** In your router settings, bind the Pi's MAC address to a static IP (e.g., 192.168.1.10).
* **DNS Configuration:** Point your domain A-records (*.yourdomain.com) to your VPS Public IP.

---

## 🧠 Phase 3: Installing the Pangolin Brain

Execute the official Pangolin Installer on the Pi 5.

```bash
sudo mkdir -p /opt/pangolin && cd /opt/pangolin
curl -fsSL https://static.pangolin.net/get-installer.sh | bash
```

### 📋 Installer Walkthrough:
* **Base Domain:** yourdomain.com
* **Dashboard Domain:** pangolin.yourdomain.com
* **Let's Encrypt Email:** your@email.com
* **Use Gerbil for Tunneling?** yes (Required for the VPS bridge).
* **Security:** Choose yes to "Disable Signup without Invite" to secure the hub.

---

## 🔗 Phase 4: Configuring the VPS Relay

The VPS serves as the "Dumb Pipe" entry point into your home network.

1. **On the Pi Dashboard:** Go to Sites → Add Site.
2. **Site Type:** Select Newt Tunnel.
3. **Credentials:** Copy the generated ID, Secret, and Endpoint.
4. **On the VPS:** Run the Newt client via Docker:

```bash
docker run -d --name newt-relay \
  --restart unless-stopped \
  --network host \
  -e PANGOLIN_ENDPOINT=https://<PI_LOCAL_IP> \
  -e NEWT_ID=<PASTE_ID> \
  -e NEWT_SECRET=<PASTE_SECRET> \
  fosrl/newt:latest
```

---

## 🚀 Phase 5: Live Cutover

1. **Verify Status:** In the Pi Dashboard, ensure the VPS-Relay site is Online.
2. **Enable Ingress:** In Sites > VPS-Relay, toggle Public Ingress to ON.
3. **Shutdown Old Stack:** Stop any existing proxy or legacy Pangolin services on the VPS to clear ports 80 and 443.
4. **Test:** Navigate to https://pangolin.yourdomain.com. Your traffic is now entering the VPS and being processed by your local Pi 5.

---

## 📊 Pro/Con Analysis

| Feature | Pi-Hub (Local Brain) | Legacy VPS |
|---------|---------------------|------------|
| Data Privacy | 100% - Keys/DB stay at home. | Low - Data on remote server. |
| I/O Speed | High (~900MB/s Gen 3 NVMe). | Variable (Shared I/O). |
| Security | VPS is a "Dumb Pipe" relay only. | High credential exposure on VPS. |
| Reliability | Depends on home uptime. | Datacenter-grade uptime. |

---

## 🏁 Verification

Confirm your NVMe is optimized and achieving Gen 3 speeds:

```bash
dd if=/dev/zero of=/opt/pangolin/test.img bs=1G count=1 oflag=dsync
```

---

**Maintained by Dan | ⭐ Star this repo if it helped!**

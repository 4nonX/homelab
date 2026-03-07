# 🏗️ Pangolin Infrastructure as Code (Terraform)

[![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)](https://terraform.io)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://cloudflare.com)
[![MinIO](https://img.shields.io/badge/MinIO-C72E49?style=for-the-badge&logo=minio&logoColor=white)](https://min.io)

> **Infrastructure as Code setup for the Pangolin VPS gateway**, enabling full disaster recovery in ~15 minutes. Cloudflare DNS, VPS provisioning, stack deployment, and automated backups — all reproducible from a single `terraform apply`.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [File Structure](#-file-structure)
- [Prerequisites](#-prerequisites)
- [Setup Guide](#-setup-guide)
- [Backup Strategy](#-backup-strategy)
- [Disaster Recovery](#-disaster-recovery)
- [Key Decisions](#-key-decisions)

---

## 🎯 Overview

**Problem:** The Pangolin VPS is a single point of failure. If IONOS terminates or the VPS dies, all external access to the homelab goes down.

**Solution:** Full Infrastructure as Code setup that can rebuild the entire VPS gateway from scratch in ~15 minutes, including DNS cutover, Docker stack deployment, and config restore from backup.

**What Terraform manages:**

| Resource | Provider | Details |
|---|---|---|
| DNS record: `d-net.me` (root A) | Cloudflare | Points to VPS IP |
| DNS record: `pangolin.d-net.me` (A) | Cloudflare | Points to VPS IP |
| DNS record: `*.d-net.me` (wildcard CNAME) | Cloudflare | → `pangolin.d-net.me` |
| VPS provisioning | null_resource + SSH | Docker, stack, backup, cron |

**What Terraform does NOT manage** (intentionally):

- IONOS VPS creation — no Terraform provider for IONOS VPS product (only CloudAPI/DCD)
- Other Cloudflare records (ProtonMail MX/TXT/DKIM, Tailscale VPN CNAME, Headscale UI, Vercel CNAME)
- Domain registrar (Squarespace) — changes never needed

---

## 🏛️ Architecture

```
Developer Machine (Windows)
        │
        ├─ terraform apply
        │
        ├──► Cloudflare API
        │       └─ Update DNS: d-net.me A, pangolin A, *.d-net.me CNAME
        │
        └──► SSH → New IONOS VPS
                ├─ Install Docker + mc (MinIO client)
                ├─ mc alias set nas https://minio.d-net.me
                ├─ mc cp nas/pangolin-backup/latest.tar.gz → /tmp/
                ├─ Restore config/ (DB, certs, WireGuard key, CrowdSec)
                ├─ docker compose up -d
                └─ Install cron: Sunday 3am → /root/backup.sh

State Backend:
        MinIO on NAS (ZimaOS) ──► https://minio.d-net.me
        Bucket: terraform-state

Backup Storage:
        MinIO on NAS (ZimaOS) ──► https://minio.d-net.me
        Bucket: pangolin-backup
        └─ latest.tar.gz       (always current)
        └─ history/            (8 weeks retained)
```

---

## 📁 File Structure

```
infrastructure/networking/pangolin/terraform/
├── main.tf                    # Provider configuration (Cloudflare)
├── backend.tf                 # MinIO S3 state backend
├── variables.tf               # All variable declarations
├── cloudflare.tf              # DNS records (3 managed records)
├── vps.tf                     # VPS provisioning via remote-exec
├── terraform.tfvars           # ⚠️ LOCAL ONLY — gitignored, from Vaultwarden
├── terraform.tfvars.example   # Template — safe to commit
├── .gitignore                 # Excludes tfvars, .terraform/, state files
├── run.ps1                    # PowerShell helper (validates tfvars exists)
├── DR_RUNBOOK.md              # Step-by-step disaster recovery procedure
├── docker-compose.yml         # Pangolin stack (deployed to VPS by Terraform)
├── config/
│   ├── config.yml             # Pangolin configuration
│   └── traefik/
│       ├── traefik_config.yml # Traefik static config
│       └── dynamic_config.yml # Traefik dynamic config
├── scripts/
│   ├── backup.sh              # Weekly backup to MinIO (deployed to VPS)
│   └── restore.sh             # DR restore from MinIO (deployed to VPS)
└── minio/
    └── docker-compose.yml     # MinIO stack for Dockge on NAS
```

---

## ✅ Prerequisites

### On the NAS

MinIO must be running and accessible via Pangolin tunnel:

```bash
# Deploy via Dockge using minio/docker-compose.yml
# Verify:
curl -s https://minio.d-net.me/minio/health/live  # Returns 200 (empty body = healthy)
```

Two buckets required:
- `terraform-state` — Terraform remote state
- `pangolin-backup` — VPS config backups

### On the New VPS

SSH key must be added before running `terraform apply`:

```bash
ssh root@NEW_VPS_IP
mkdir -p ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH2FWIyW0qG4WHuw74na7HDB5JISJMNWrL4Cft6Peedu terraform-homelab" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### On the Developer Machine

- Terraform installed (`winget install HashiCorp.Terraform`)
- `terraform.tfvars` populated from Vaultwarden secure note **"terraform-homelab-tfvars"**

---

## 🚀 Setup Guide

> This section documents the **initial setup** performed on 2026-03-07. For disaster recovery, see [DR_RUNBOOK.md](./DR_RUNBOOK.md).

### 1. MinIO on NAS

Deploy using `minio/docker-compose.yml` via Dockge. Create buckets `terraform-state` and `pangolin-backup`.

Expose the S3 API (port 9000) via a Pangolin resource at `https://minio.d-net.me`.

> **Note:** MinIO has two ports — port 9001 is the Web UI, port 9000 is the S3 API. Only the S3 API needs to be exposed via Pangolin.

### 2. Terraform Init

```powershell
cd infrastructure/networking/pangolin/terraform
terraform init
```

This downloads the Cloudflare provider and connects to the MinIO S3 backend. Verify with:

```
Terraform has been successfully initialized!
Backend: s3 (MinIO at https://minio.d-net.me)
```

### 3. Import Existing DNS Records

Since DNS records were pre-existing, they were imported rather than created (no downtime):

```powershell
terraform import cloudflare_record.root    "ZONE_ID/RECORD_ID"
terraform import cloudflare_record.pangolin "ZONE_ID/RECORD_ID"
terraform import cloudflare_record.wildcard "ZONE_ID/RECORD_ID"
```

After import, run `terraform plan` — should show 0 changes (or only metadata like `allow_overwrite`).

### 4. Deploy Scripts to VPS

On first setup, the backup/restore scripts must be copied manually (they are deployed automatically on subsequent DR runs via `terraform apply`):

```powershell
scp scripts/backup.sh  root@VPS_IP:/root/backup.sh
scp scripts/restore.sh root@VPS_IP:/root/restore.sh
ssh root@VPS_IP "chmod +x /root/backup.sh /root/restore.sh"
```

### 5. Run First Backup

```powershell
ssh root@VPS_IP "/root/backup.sh"
```

Expected output:
```
[timestamp] Starting Pangolin backup...
[timestamp] Archive created: /tmp/pangolin-backup-YYYYMMDD_HHMMSS.tar.gz (43M)
[timestamp] Backup uploaded to MinIO successfully
[timestamp] Backup complete.
```

---

## 💾 Backup Strategy

| Attribute | Value |
|---|---|
| Schedule | Every Sunday at 3:00 AM UTC (cron) |
| Storage | MinIO on NAS via `https://minio.d-net.me` |
| Bucket | `pangolin-backup` |
| Current backup | `latest.tar.gz` (always overwritten) |
| History | `history/pangolin-backup-YYYYMMDD_HHMMSS.tar.gz` |
| Retention | 8 weekly backups (~2 months) |
| Backup size | ~43MB compressed |
| Log | `/var/log/pangolin-backup.log` on VPS |

**What gets backed up** (`/opt/pangolin/config/`):

- Pangolin SQLite database (users, resources, tunnels)
- Let's Encrypt certificates (avoids rate-limit delays on restore)
- CrowdSec decisions database
- Gerbil WireGuard private key (preserves tunnel identity)

**What is NOT backed up** (rebuilt by Terraform):

- `docker-compose.yml` — in Git
- `config.yml`, Traefik configs — in Git
- Docker images — pulled fresh on restore

---

## 🔑 Key Decisions

### Why not use the IONOS Terraform provider?

IONOS offers two products: the **VPS product** (simple, cheap, used here) and **Cloud/DCD** (enterprise). The Terraform provider (`ionos-cloud/ionoscloud`) only supports Cloud/DCD. The VPS product has no API. This is why VPS creation is a manual step (~2 min) and Terraform takes over from there via SSH.

### Why MinIO instead of Terraform Cloud?

State is stored on the homelab NAS via MinIO (S3-compatible). This keeps everything self-hosted, avoids external dependencies, and is accessible from anywhere via the Pangolin tunnel at `https://minio.d-net.me`.

### Why not SOPS for secrets?

SOPS 3.7.3 and 3.9.4 on Windows produced BOM encoding issues with age encryption that were not reliably solvable. Given the small number of secrets and the self-hosted nature of the infrastructure, Vaultwarden secure notes provide sufficient security with zero toolchain friction.

### Why only 3 DNS records in Terraform?

Other records (`dandressen` Vercel CNAME, Tailscale VPN, Headscale UI, ProtonMail MX/TXT/DKIM) were intentionally left unmanaged — they point to different targets and don't need to change during a VPS DR event. Managing them in Terraform would add risk without benefit.

---

## 📚 Related Documentation

| Document | Description |
|---|---|
| [DR_RUNBOOK.md](./DR_RUNBOOK.md) | Step-by-step disaster recovery procedure |
| [pangolin-infrastructure.md](../../pangolin-infrastructure.md) | Pangolin tunnel architecture overview |
| [pangolin-deployment-guide.md](../../pangolin-deployment-guide.md) | Initial Pangolin deployment guide |
| [pangolin-configurations.md](../../pangolin-configurations.md) | Pangolin configuration reference |
| [network-security.md](../../network-security.md) | Network security architecture |

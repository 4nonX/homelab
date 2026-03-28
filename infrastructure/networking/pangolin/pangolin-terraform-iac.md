# Pangolin Infrastructure as Code (Terraform)

This is the Terraform setup for the Pangolin VPS gateway. It allows me to rebuild the entire gateway from scratch in about 15 minutes - including DNS, Docker, and restoring configs from backup.

---

## ðŸ“‹ Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [File Structure](#-file-structure)
- [Prerequisites](#-prerequisites)
- [Setup Guide](#-setup-guide)
- [Backup Strategy](#-backup-strategy)
- [Disaster Recovery](#-disaster-recovery)
- [Key Decisions](#-key-decisions)

---

## Overview

The Pangolin VPS is a single point of failure. If it dies, I lose external access to the lab. This Terraform setup is my insurance policy. It manages the Cloudflare DNS records and the VPS provisioning (Docker, stack, backup cron).

I don't manage IONOS itself through Terraform because they don't have a good provider for their basic VPS product. Creation is still manual, but everything after that is automated.

---

## ðŸ›ï¸ Architecture

```
Developer Machine (Windows)
        â”‚
        â”œâ”€ terraform apply
        â”‚
        â”œâ”€â”€â–º Cloudflare API
        â”‚       â””â”€ Update DNS: d-net.me A, pangolin A, *.d-net.me CNAME
        â”‚
        â””â”€â”€â–º SSH â†’ New IONOS VPS
                â”œâ”€ Install Docker + mc (MinIO client)
                â”œâ”€ mc alias set nas https://minio.d-net.me
                â”œâ”€ mc cp nas/pangolin-backup/latest.tar.gz â†’ /tmp/
                â”œâ”€ Restore config/ (DB, certs, WireGuard key, CrowdSec)
                â”œâ”€ docker compose up -d
                â””â”€ Install cron: Sunday 3am â†’ /root/backup.sh

State Backend:
        MinIO on NAS (ZimaOS) â”€â”€â–º https://minio.d-net.me
        Bucket: terraform-state

Backup Storage:
        MinIO on NAS (ZimaOS) â”€â”€â–º https://minio.d-net.me
        Bucket: pangolin-backup
        â””â”€ latest.tar.gz       (always current)
        â””â”€ history/            (8 weeks retained)
```

---

## ðŸ“ File Structure

```
infrastructure/networking/pangolin/terraform/
â”œâ”€â”€ main.tf                    # Provider configuration (Cloudflare)
â”œâ”€â”€ backend.tf                 # MinIO S3 state backend
â”œâ”€â”€ variables.tf               # All variable declarations
â”œâ”€â”€ cloudflare.tf              # DNS records (3 managed records)
â”œâ”€â”€ vps.tf                     # VPS provisioning via remote-exec
â”œâ”€â”€ terraform.tfvars           # âš ï¸ LOCAL ONLY â€” gitignored, from Vaultwarden
â”œâ”€â”€ terraform.tfvars.example   # Template â€” safe to commit
â”œâ”€â”€ .gitignore                 # Excludes tfvars, .terraform/, state files
â”œâ”€â”€ run.ps1                    # PowerShell helper (validates tfvars exists)
â”œâ”€â”€ DR_RUNBOOK.md              # Step-by-step disaster recovery procedure
â”œâ”€â”€ docker-compose.yml         # Pangolin stack (deployed to VPS by Terraform)
â”œâ”€â”€ config/
â”‚   â”œâ”€â”€ config.yml             # Pangolin configuration
â”‚   â””â”€â”€ traefik/
â”‚       â”œâ”€â”€ traefik_config.yml # Traefik static config
â”‚       â””â”€â”€ dynamic_config.yml # Traefik dynamic config
â”œâ”€â”€ scripts/
â”‚   â”œâ”€â”€ backup.sh              # Weekly backup to MinIO (deployed to VPS)
â”‚   â””â”€â”€ restore.sh             # DR restore from MinIO (deployed to VPS)
â””â”€â”€ minio/
    â””â”€â”€ docker-compose.yml     # MinIO stack for Dockge on NAS
```

---

## âœ… Prerequisites

### On the NAS

MinIO must be running and accessible via Pangolin tunnel:

```bash
# Deploy via Dockge using minio/docker-compose.yml
# Verify:
curl -s https://minio.d-net.me/minio/health/live  # Returns 200 (empty body = healthy)
```

Two buckets required:
- `terraform-state` â€” Terraform remote state
- `pangolin-backup` â€” VPS config backups

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

## ðŸš€ Setup Guide

> This section documents the **initial setup** performed on 2026-03-07. For disaster recovery, see [DR_RUNBOOK.md](./DR_RUNBOOK.md).

### 1. MinIO on NAS

Deploy using `minio/docker-compose.yml` via Dockge. Create buckets `terraform-state` and `pangolin-backup`.

Expose the S3 API (port 9000) via a Pangolin resource at `https://minio.d-net.me`.

> **Note:** MinIO has two ports â€” port 9001 is the Web UI, port 9000 is the S3 API. Only the S3 API needs to be exposed via Pangolin.

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

After import, run `terraform plan` â€” should show 0 changes (or only metadata like `allow_overwrite`).

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

## ðŸ’¾ Backup Strategy

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

- `docker-compose.yml` â€” in Git
- `config.yml`, Traefik configs â€” in Git
- Docker images â€” pulled fresh on restore

---

## Why I built it this way

- **No IONOS Provider:** IONOS only has Terraform support for their "Enterprise" Cloud products. For the cheap VPS I use, the API doesn't exist. So I create the VPS manually and let Terraform handle the SSH provisioning.
- **MinIO for State:** I store the Terraform state on my own NAS via MinIO. It keeps things self-hosted and avoids needing an account on Terraform Cloud.
- **No SOPS for Secrets:** I tried using SOPS, but it kept having encoding issues on Windows with `age` encryption. Since I don't have many secrets, storing them in Vaultwarden is just easier and more reliable.
- **DNS Scope:** I only manage the 3 records needed for the tunnel in this Terraform setup. Everything else (email, other sites) is handled manually so a mistake here doesn't take down my entire domain.

---

## ðŸ“š Related Documentation

| Document | Description |
|---|---|
| [DR_RUNBOOK.md](./DR_RUNBOOK.md) | Step-by-step disaster recovery procedure |
| [pangolin-infrastructure.md](../../pangolin-infrastructure.md) | Pangolin tunnel architecture overview |
| [pangolin-deployment-guide.md](../../pangolin-deployment-guide.md) | Initial Pangolin deployment guide |
| [pangolin-configurations.md](../../pangolin-configurations.md) | Pangolin configuration reference |
| [network-security.md](../../network-security.md) | Network security architecture |

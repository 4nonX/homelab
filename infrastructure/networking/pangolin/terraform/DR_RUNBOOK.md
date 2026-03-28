# Disaster Recovery Runbook: Pangolin VPS

## Normal Operation (nothing to do)

- Backup runs automatically every Sunday at 3am UTC
- Stored in MinIO via Pangolin tunnel â†’ bucket `pangolin-backup`
- Last 8 weekly backups retained (2 months history)
- Logs: `ssh root@217.154.249.11 "tail -f /var/log/pangolin-backup.log"`

---

## Disaster Recovery â€” VPS is dead

**Total estimated time: ~15 minutes**

### Step 1 â€” Create new VPS in IONOS panel (2 min)

1. Log into [cloud.ionos.de](https://cloud.ionos.de)
2. Create new VPS: Ubuntu 24.04, `vps 2 2 80`, Berlin datacenter
3. Note the new public IP address

### Step 2 â€” Add SSH key to new VPS (1 min)

IONOS provides a temporary root password. SSH in and add the Terraform key:

```bash
ssh root@NEW_VPS_IP
mkdir -p ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH2FWIyW0qG4WHuw74na7HDB5JISJMNWrL4Cft6Peedu terraform-homelab" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 3 â€” Restore terraform.tfvars from Vaultwarden (30 sec)

Open Vaultwarden secure note **"terraform-homelab-tfvars"** and copy the contents to:

```
infrastructure/networking/pangolin/terraform/terraform.tfvars
```

Update the IP:

```hcl
vps_ip = "NEW_VPS_IP"
```

### Step 4 â€” Run Terraform (10 min)

```powershell
cd infrastructure/networking/pangolin/terraform
.\run.ps1
```

Or directly:

```powershell
terraform apply
```

Terraform will automatically:
- Update Cloudflare DNS (root A, pangolin A, wildcard CNAME) to new IP
- SSH into new VPS
- Install Docker + MinIO client (`mc`)
- Configure `mc` alias pointing to `https://minio.d-net.me`
- Download latest backup from NAS (`pangolin-backup/latest.tar.gz`)
- Restore: Pangolin DB, Let's Encrypt certs, CrowdSec data, Gerbil WireGuard key
- Deploy full stack (Pangolin 1.12.2 + Gerbil 1.2.2 + Traefik v3.5 + CrowdSec)
- Install weekly backup cron (Sunday 3am UTC)

### Step 5 â€” Verify (2 min)

```bash
ssh root@NEW_VPS_IP "docker compose -f /opt/pangolin/docker-compose.yml ps"
```

All services should show `Up`. Then check the dashboard:

```
https://pangolin.d-net.me
```

---

## Prerequisites

These must be running/accessible for DR to work:

| Requirement | Location | Check |
|---|---|---|
| NAS online | Home network | `ping 192.168.8.158` |
| MinIO reachable | `https://minio.d-net.me` | `Invoke-RestMethod https://minio.d-net.me/minio/health/live` |
| Backup exists | MinIO bucket `pangolin-backup` | `mc ls nas/pangolin-backup/` |
| SSH key | `~/.ssh/id_ed25519` | `ssh-keygen -l -f ~/.ssh/id_ed25519` |
| terraform.tfvars | Vaultwarden secure note | â€” |

---

## Useful Commands

```bash
# Run manual backup now
ssh root@217.154.249.11 "/root/backup.sh"

# Check backup history in MinIO
ssh root@217.154.249.11 "mc ls nas/pangolin-backup/history/"

# Verify cron is installed
ssh root@217.154.249.11 "crontab -l"

# Stack status
ssh root@217.154.249.11 "docker compose -f /opt/pangolin/docker-compose.yml ps"

# Check backup log
ssh root@217.154.249.11 "tail -50 /var/log/pangolin-backup.log"

# Restore specific historical backup
ssh root@217.154.249.11 "mc cp nas/pangolin-backup/history/pangolin-backup-YYYYMMDD_HHMMSS.tar.gz /tmp/pangolin-backup.tar.gz && /root/restore.sh"
```

```powershell
# Terraform state inspection
terraform state list
terraform show

# Plan without applying (safe read-only check)
terraform plan
```

---

## Key Values (no secrets here â€” see Vaultwarden)

| Item | Value |
|---|---|
| VPS location | IONOS Berlin |
| Stack path on VPS | `/opt/pangolin/` |
| Scripts path on VPS | `/root/backup.sh`, `/root/restore.sh` |
| MinIO S3 endpoint | `https://minio.d-net.me` |
| MinIO UI | `https://minio-ui.d-net.me` (port 9001) |
| Backup bucket | `pangolin-backup` |
| State bucket | `terraform-state` |
| Cloudflare zone | `d-net.me` |
| SSH public key | `~/.ssh/id_ed25519.pub` (terraform-homelab) |

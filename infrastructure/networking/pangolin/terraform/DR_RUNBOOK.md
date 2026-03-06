# Disaster Recovery Runbook — Pangolin VPS

## Daily workflow
```powershell
.\run.ps1 plan    # Preview changes
.\run.ps1 apply   # Apply changes
```
Your age key at `~\.age\homelab.key` decrypts secrets automatically. Plaintext is deleted after every run.

---

## First-time setup (do once)

### 1. Install tools
```powershell
winget install Mozilla.sops
winget install Hashicorp.Terraform
```
(age is already installed)

### 2. Your age key is already at:
`C:\Users\dandr\.age\homelab.key`
**Back this up somewhere safe** (Vaultwarden, encrypted drive).
If you lose it, you cannot decrypt `terraform.tfvars.enc`.

### 3. Start MinIO on NAS
```bash
cd /path/to/minio
docker compose up -d
```
Open `http://192.168.8.158:9001` → login → create bucket `pangolin-backup` (private).

### 4. Encrypt tfvars
```powershell
# terraform.tfvars is already filled in — encrypt it:
.\encrypt.ps1
Remove-Item terraform.tfvars
# Commit terraform.tfvars.enc to git
```

### 5. Initialize Terraform
```powershell
.\run.ps1 init
.\run.ps1 plan
```

### 6. Import existing Cloudflare DNS records (first time only)
```powershell
# Get record IDs
$headers = @{ Authorization = "Bearer b3b039aad5e04372cb062b5c8823788b5c809" }
Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/df398bb255621073b88546f49184b9d5/dns_records" -Headers $headers | ConvertTo-Json -Depth 5

# Import (replace RECORD_ID with id from above output)
.\run.ps1 import cloudflare_record.wildcard df398bb255621073b88546f49184b9d5/RECORD_ID
.\run.ps1 import cloudflare_record.root df398bb255621073b88546f49184b9d5/RECORD_ID
```

### 7. Run first backup manually
```powershell
ssh root@217.154.249.11 "/root/backup.sh"
```

---

## Disaster Recovery — VPS is dead

**Total estimated time: ~15 minutes**

### Step 1 — Create new VPS in IONOS panel (2 min)
1. Log into cloud.ionos.de
2. Create VPS: Ubuntu 24.04, vps 2 2 80, Berlin
3. Note the new public IP

### Step 2 — Add SSH key to new VPS (1 min)
```bash
ssh root@NEW_IP
mkdir -p ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH2FWIyW0qG4WHuw74na7HDB5JISJMNWrL4Cft6Peedu terraform-homelab" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 3 — Update encrypted tfvars (1 min)
```powershell
sops --decrypt terraform.tfvars.enc > terraform.tfvars
notepad terraform.tfvars   # update vps_ip
.\encrypt.ps1
Remove-Item terraform.tfvars
```

### Step 4 — Apply (10 min)
```powershell
.\run.ps1 apply
```

Terraform will automatically:
- Update Cloudflare DNS to new IP
- Install Docker on new VPS
- Restore Pangolin DB + Let's Encrypt certs + CrowdSec decisions from MinIO
- Start full Pangolin/Gerbil/Traefik/CrowdSec stack
- Reinstall weekly backup cron

### Step 5 — Verify
```powershell
ssh root@NEW_IP "docker compose -f /root/pangolin/docker-compose.yml ps"
```
Check: https://pangolin.d-net.me

---

## Backup info
- Schedule: every Sunday at 3:00am (cron on VPS)
- Location: MinIO → `pangolin-backup/latest.tar.gz`
- History: last 8 weeks retained
- Covers: Pangolin DB, Let's Encrypt certs, CrowdSec decisions, Gerbil WireGuard key

```powershell
# Check backup history
ssh root@217.154.249.11 "mc ls nas/pangolin-backup/history/"

# Trigger manual backup now
ssh root@217.154.249.11 "/root/backup.sh"

# Check backup log
ssh root@217.154.249.11 "tail -50 /var/log/pangolin-backup.log"
```

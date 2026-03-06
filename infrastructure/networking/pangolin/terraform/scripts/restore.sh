#!/bin/bash
# Pangolin VPS Restore Script
# Used during disaster recovery to restore from MinIO backup

set -e

PANGOLIN_DIR="/root/pangolin"
BACKUP_FILE="/tmp/pangolin-restore-latest.tar.gz"

echo "[$(date)] Starting Pangolin restore..."

# Configure MinIO client
mc alias set nas http://192.168.8.158:9000 DanDressen DHimHmwnmPS23 --api S3v4 2>/dev/null

# Check backup exists
if ! mc ls nas/pangolin-backup/latest.tar.gz &>/dev/null; then
    echo "[$(date)] ERROR: No backup found at nas/pangolin-backup/latest.tar.gz"
    echo "[$(date)] Proceeding with fresh deployment..."
    exit 0
fi

# Download latest backup
echo "[$(date)] Downloading latest backup..."
mc cp "nas/pangolin-backup/latest.tar.gz" "$BACKUP_FILE"

echo "[$(date)] Backup downloaded: $(du -sh $BACKUP_FILE | cut -f1)"

# Create pangolin dir if not exists
mkdir -p "$PANGOLIN_DIR"

# Stop stack if running
if docker compose -f "$PANGOLIN_DIR/docker-compose.yml" ps -q 2>/dev/null | grep -q .; then
    echo "[$(date)] Stopping existing stack..."
    docker compose -f "$PANGOLIN_DIR/docker-compose.yml" down
fi

# Restore config (preserves existing docker-compose.yml)
echo "[$(date)] Extracting backup..."
tar -xzf "$BACKUP_FILE" -C "$PANGOLIN_DIR"

# Fix permissions
chmod 600 "$PANGOLIN_DIR/config/letsencrypt/acme.json" 2>/dev/null || true

echo "[$(date)] Restore complete."
echo "[$(date)] Stack will be started by Terraform provisioner."

# Cleanup
rm -f "$BACKUP_FILE"

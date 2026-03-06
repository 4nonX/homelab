#!/bin/bash
# Pangolin VPS Backup Script
# Runs weekly via cron: 0 3 * * 0
# Uploads to MinIO on NAS at 192.168.8.158

set -e

BACKUP_DIR="/tmp/pangolin-backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/pangolin-backup-${TIMESTAMP}.tar.gz"
PANGOLIN_DIR="/root/pangolin"

echo "[$(date)] Starting Pangolin backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Stop nothing - backup live (safe for SQLite with WAL mode + letsencrypt)
# Backup: config (includes DB, certs, crowdsec data)
tar -czf "$BACKUP_FILE" \
    -C "$PANGOLIN_DIR" \
    config/

echo "[$(date)] Archive created: $BACKUP_FILE ($(du -sh $BACKUP_FILE | cut -f1))"

# Upload to MinIO
mc alias set nas http://192.168.8.158:9000 DanDressen DHimHmwnmPS23 --api S3v4 2>/dev/null

# Upload timestamped version
mc cp "$BACKUP_FILE" "nas/pangolin-backup/history/pangolin-backup-${TIMESTAMP}.tar.gz"

# Upload as latest (overwrite)
mc cp "$BACKUP_FILE" "nas/pangolin-backup/latest.tar.gz"

echo "[$(date)] Backup uploaded to MinIO successfully"

# Keep only last 8 weekly backups in history (2 months)
BACKUP_COUNT=$(mc ls nas/pangolin-backup/history/ | wc -l)
if [ "$BACKUP_COUNT" -gt 8 ]; then
    OLDEST=$(mc ls nas/pangolin-backup/history/ | sort | head -1 | awk '{print $NF}')
    mc rm "nas/pangolin-backup/history/$OLDEST"
    echo "[$(date)] Removed oldest backup: $OLDEST"
fi

# Cleanup local temp
rm -f "$BACKUP_FILE"

echo "[$(date)] Backup complete."

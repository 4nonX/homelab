# Pangolin High Availability Setup

A practical guide to building active-passive failover for a self-hosted [Pangolin](https://github.com/fosrl/pangolin) instance, since Pangolin itself doesn't ship native HA between two self-hosted servers.

This setup uses:
- **Two VPSes** running identical Pangolin stacks (primary serves traffic, standby idles)
- **Litestream** for continuous SQLite replication via object storage
- **Cloudflare DNS-01** for wildcard certificates (both boxes can independently issue/renew)
- **A monitor script** on the standby that flips DNS via the Cloudflare API when the primary fails
- **A manual failback script** for returning to the primary after recovery

Failover is sticky and triggers after ~5 minutes of TCP unreachability on port 443. Total RTO is around 7-8 minutes from outage start to standby serving traffic. Failback is manual to avoid losing writes that happened during failover.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture](#architecture)
3. [Conventions and Placeholders](#conventions-and-placeholders)
4. [Phase 1: Object Storage (Backblaze B2)](#phase-1-object-storage-backblaze-b2)
5. [Phase 2: Primary Setup](#phase-2-primary-setup)
6. [Phase 3: Standby Setup](#phase-3-standby-setup)
7. [Phase 4: Failover Automation](#phase-4-failover-automation)
8. [Phase 5: Failback Script](#phase-5-failback-script)
9. [Operations](#operations)
10. [Operational Notes](#operational-notes)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Two Linux VPSes (Ubuntu/Debian-based; this guide uses Ubuntu 24.04 syntax) on independent providers or at least independent network paths
- A domain managed in Cloudflare (free tier is fine; this guide does not require Cloudflare Load Balancer)
- An existing working Pangolin install on the primary VPS following the [official quick start](https://docs.pangolin.net/self-host/quick-install)
- Root SSH access to both VPSes
- Both VPSes able to reach the public internet outbound on HTTPS
- A Backblaze B2 account (free tier sufficient for typical Pangolin DB sizes)

This guide assumes Pangolin EE 1.18.x. Adjust image tags for other versions.

## Architecture

```
                      Cloudflare DNS
              app.example.com → <PRIMARY_IP>
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
    PRIMARY VPS                     STANDBY VPS
    <PRIMARY_IP>                    <STANDBY_IP>
    ┌────────────────┐              ┌────────────────┐
    │ Pangolin       │              │ Pangolin       │
    │ Traefik        │              │ Traefik        │
    │ + wildcard cert│              │ + wildcard cert│
    │ + CrowdSec     │              │ + CrowdSec     │
    │ Gerbil         │              │ Gerbil         │
    │ (running)      │              │ (stopped)      │
    │                │              │                │
    │ Litestream ────┼─── B2 ───────┼──── pull (60s) │
    │ push (1s)      │              │                │
    │                │   ┌──────────┤                │
    │ ◄──TCP:443─────┼───┘          │ failover mon   │
    │   health probe │              │ (60s)          │
    └────────────────┘              └────────────────┘
              ▲
              │ manual failback
              └─────────────────────────
```

**Primary** runs the full Pangolin stack and pushes SQLite changes to B2 every second via Litestream.

**Standby** has an identical stack but the containers are stopped. A systemd timer pulls the latest DB from B2 every 60 seconds. Another timer probes the primary every 60 seconds. After 5 consecutive failures, the standby boots its stack and flips the DNS A record.

## Conventions and Placeholders

Replace these throughout the guide with your actual values:

| Placeholder | Meaning | Example |
|-------------|---------|---------|
| `<DOMAIN>` | Your base domain | `example.com` |
| `<PANGOLIN_HOST>` | Pangolin dashboard hostname | `app.example.com` |
| `<PRIMARY_IP>` | Primary VPS public IPv4 | `203.0.113.10` |
| `<STANDBY_IP>` | Standby VPS public IPv4 | `198.51.100.20` |
| `<EMAIL>` | Admin email | `admin@example.com` |
| `<CF_TOKEN>` | Cloudflare API token (DNS edit on zone) | `cfut_abc123...` |
| `<CF_ZONE>` | Cloudflare zone ID for `<DOMAIN>` | 32-char hex |
| `<CF_RECORD>` | Cloudflare DNS record ID for `<PANGOLIN_HOST>` | 32-char hex |
| `<B2_KEY_ID>` | Backblaze B2 application key ID | `00abc123...` |
| `<B2_APP_KEY>` | Backblaze B2 application key | `K003xyz...` |
| `<B2_BUCKET>` | B2 bucket name | `myorg-pangolin-litestream` |
| `<B2_ENDPOINT>` | B2 S3-compatible endpoint | `https://s3.eu-central-003.backblazeb2.com` |
| `<B2_REGION>` | Region segment of the endpoint | `eu-central-003` |
| `<SMTP_HOST>` / `<SMTP_USER>` / `<SMTP_PASS>` | SMTP relay credentials | provider-specific |

## Phase 1: Object Storage (Backblaze B2)

### 1.1 Create a B2 bucket

In the [Backblaze B2 dashboard](https://www.backblaze.com/cloud-storage):

1. Create a new bucket:
   - **Name**: `<B2_BUCKET>` (globally unique)
   - **Files in Bucket are**: Private
   - **Default Encryption**: Enable (AES-256, free)
   - **Object Lock**: Disable (Litestream needs to delete old files)
2. Open the bucket settings → **Lifecycle Settings** → Keep prior versions for **7 days** (auto-cleans Litestream's old WAL segments)

Note the **endpoint** shown on the bucket overview, e.g. `s3.eu-central-003.backblazeb2.com`. The region string is the middle segment (`eu-central-003`). Pick a region close to your VPSes.

### 1.2 Create an application key

Under **Application Keys** → **Add a New Application Key**:

- **Name**: `pangolin-litestream-primary`
- **Allow access to Bucket**: just the bucket you created
- **Type of Access**: Read and Write
- **Allow List All Bucket Names**: No
- **File name prefix**: empty
- **Duration**: empty (no expiry)

Save the `keyID` and `applicationKey` immediately, B2 only shows them once.

For the standby, you can either reuse this key or (cleaner) create a second read-only key. This guide reuses the same key to keep things simple.

## Phase 2: Primary Setup

Assumes you already have a working Pangolin install at `/opt/pangolin` on the primary. We'll add wildcard certs via DNS-01 and continuous DB replication to B2.

### 2.1 Create a Cloudflare API token

In Cloudflare dashboard → **My Profile** → **API Tokens** → **Create Token** → Custom token:

- **Token name**: `pangolin-dns01-<DOMAIN>`
- **Permissions**: `Zone` → `DNS` → `Edit`
- **Zone Resources**: Include → Specific zone → `<DOMAIN>`
- **TTL**: empty (no expiry)

Save the token as `<CF_TOKEN>`. Verify it works:

```bash
curl -s "https://api.cloudflare.com/client/v4/zones?name=<DOMAIN>" \
  -H "Authorization: Bearer <CF_TOKEN>" | jq '.result[0].id'
```

Returns the zone ID (`<CF_ZONE>`). Note this too.

### 2.2 Switch Traefik from HTTP-01 to DNS-01

Edit `/opt/pangolin/docker-compose.yml`, add an `environment` block to the `traefik` service:

```yaml
  traefik:
    # ... existing config ...
    environment:
      CLOUDFLARE_DNS_API_TOKEN: <CF_TOKEN>
```

> For security, consider storing this in `/opt/pangolin/.env` and referencing it as `${CLOUDFLARE_DNS_API_TOKEN}` instead of inlining.

Edit `/opt/pangolin/config/traefik/traefik_config.yml`. Replace the `certificatesResolvers` block:

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      caServer: https://acme-v02.api.letsencrypt.org/directory
      email: <EMAIL>
      storage: /letsencrypt/acme.json
      dnsChallenge:
        provider: cloudflare
        resolvers:
          - "1.1.1.1:53"
          - "1.0.0.1:53"
        propagation:
          delayBeforeChecks: 10s
```

### 2.3 Request a wildcard certificate

Edit `/opt/pangolin/config/traefik/dynamic_config.yml`. At the bottom, add a top-level `tls:` block:

```yaml
tls:
  stores:
    default:
      defaultGeneratedCert:
        resolver: letsencrypt
        domain:
          main: "<DOMAIN>"
          sans:
            - "*.<DOMAIN>"
```

### 2.4 Apply changes

```bash
cd /opt/pangolin

# Back up existing certs
cp config/letsencrypt/acme.json config/letsencrypt/acme.json.bak.$(date +%Y%m%d)

# Wipe acme.json to force a clean wildcard issuance
echo "{}" > config/letsencrypt/acme.json
chmod 600 config/letsencrypt/acme.json

# Recreate Traefik
docker compose up -d --force-recreate traefik

# Watch the cert get issued (30-90 seconds)
docker logs -f traefik 2>&1 | grep -iE 'acme|cloudflare|certif'
```

Verify the new wildcard cert:

```bash
echo | openssl s_client -connect <PANGOLIN_HOST>:443 -servername <PANGOLIN_HOST> 2>/dev/null \
  | openssl x509 -noout -text | grep -A1 "Subject Alternative Name"
```

Output should include `DNS:*.<DOMAIN>` and `DNS:<DOMAIN>`.

### 2.5 Install Litestream

```bash
LITESTREAM_VERSION=0.5.11
cd /tmp
wget "https://github.com/benbjohnson/litestream/releases/download/v${LITESTREAM_VERSION}/litestream-${LITESTREAM_VERSION}-linux-x86_64.tar.gz"
tar -xzf litestream-${LITESTREAM_VERSION}-linux-x86_64.tar.gz
mv litestream /usr/local/bin/
chmod +x /usr/local/bin/litestream
rm litestream-${LITESTREAM_VERSION}-linux-x86_64.tar.gz
litestream version
```

### 2.6 Configure Litestream (primary, push mode)

```bash
cat > /etc/litestream.yml <<EOF
access-key-id: <B2_KEY_ID>
secret-access-key: <B2_APP_KEY>

dbs:
  - path: /opt/pangolin/config/db/db.sqlite
    replicas:
      - type: s3
        bucket: <B2_BUCKET>
        path: pangolin-db
        endpoint: <B2_ENDPOINT>
        region: <B2_REGION>
        force-path-style: true
        retention: 168h
        retention-check-interval: 1h
        sync-interval: 1s
EOF

chmod 600 /etc/litestream.yml
```

Test interactively:

```bash
litestream replicate -config /etc/litestream.yml
# Expect: "initial snapshot", "ltx file uploaded", repeated "replica sync"
# Ctrl-C after ~30 seconds
```

Confirm objects exist in B2:

```bash
litestream ltx -config /etc/litestream.yml /opt/pangolin/config/db/db.sqlite
# Should list one or more LTX files with sizes and timestamps
```

### 2.7 Run Litestream as a systemd service

```bash
cat > /etc/systemd/system/litestream.service <<'EOF'
[Unit]
Description=Litestream SQLite replication
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/litestream replicate -config /etc/litestream.yml
Restart=always
RestartSec=5

NoNewPrivileges=true
ProtectSystem=full
ProtectHome=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now litestream
systemctl status litestream --no-pager
```

Primary is now replicating to B2 continuously.

## Phase 3: Standby Setup

The standby runs an identical Pangolin stack but stays stopped. The crucial part: secrets must match the primary so existing user sessions and Newt site connectors continue working after failover.

### 3.1 Install Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
```

### 3.2 Bootstrap the Pangolin config from the primary

On the **primary**, package the config (excluding volatile/instance-specific bits):

```bash
cd /opt/pangolin
tar czf /tmp/pangolin-bootstrap.tar.gz \
    --exclude='pangolin/config/db/*' \
    --exclude='pangolin/config/crowdsec/db/*' \
    --exclude='pangolin/config/letsencrypt/acme.json*' \
    --exclude='pangolin/config/traefik/logs/*' \
    --exclude='pangolin/config/logs/*' \
    pangolin

scp /tmp/pangolin-bootstrap.tar.gz root@<STANDBY_IP>:/tmp/
```

On the **standby**:

```bash
mkdir -p /opt
cd /opt
tar xzf /tmp/pangolin-bootstrap.tar.gz
```

### 3.3 Standby-specific cleanup

These files must NOT be inherited from the primary:

```bash
cd /opt/pangolin

# Standby will issue its own cert
echo "{}" > config/letsencrypt/acme.json
chmod 600 config/letsencrypt/acme.json

# DB will be restored from B2
rm -f config/db/db.sqlite config/db/db.sqlite-*
```

These files MUST match the primary (already true because we copied them):

- `config/config.yml` (Pangolin's `server.secret` and all other secrets)
- `config/key` (Gerbil's WireGuard private key)
- `docker-compose.yml` (same images, same Cloudflare token env var)

Verify with hashes; both lines must match exactly on both boxes:

```bash
sha256sum /opt/pangolin/config/config.yml /opt/pangolin/config/key
```

### 3.4 CrowdSec bouncer key

The Traefik bouncer key in `dynamic_config.yml` was the primary's key. The standby has its own CrowdSec instance with its own LAPI. We need a separate bouncer.

We'll boot the stack briefly, generate the standby's bouncer, then update the config.

First, temporarily disable the CrowdSec middleware so Traefik doesn't fail on a bad key. Edit `config/traefik/traefik_config.yml`, comment out the crowdsec line in the websecure entrypoint:

```yaml
  websecure:
    address: :443
    http:
      # ... existing config ...
      middlewares:
        # - crowdsec@file
        - security-headers@file
```

### 3.5 Install Litestream on the standby (pull mode)

```bash
LITESTREAM_VERSION=0.5.11
cd /tmp
wget "https://github.com/benbjohnson/litestream/releases/download/v${LITESTREAM_VERSION}/litestream-${LITESTREAM_VERSION}-linux-x86_64.tar.gz"
tar -xzf litestream-${LITESTREAM_VERSION}-linux-x86_64.tar.gz
mv litestream /usr/local/bin/
chmod +x /usr/local/bin/litestream
rm litestream-${LITESTREAM_VERSION}-linux-x86_64.tar.gz
```

Create `/etc/litestream.yml` (note: no `retention` section, the standby never deletes from B2):

```bash
cat > /etc/litestream.yml <<EOF
access-key-id: <B2_KEY_ID>
secret-access-key: <B2_APP_KEY>

dbs:
  - path: /opt/pangolin/config/db/db.sqlite
    replicas:
      - type: s3
        bucket: <B2_BUCKET>
        path: pangolin-db
        endpoint: <B2_ENDPOINT>
        region: <B2_REGION>
        force-path-style: true
        sync-interval: 1s
EOF

chmod 600 /etc/litestream.yml
```

### 3.6 Initial DB restore

```bash
litestream restore -config /etc/litestream.yml /opt/pangolin/config/db/db.sqlite
ls -lh /opt/pangolin/config/db/db.sqlite

# Sanity check
apt install -y sqlite3
sqlite3 /opt/pangolin/config/db/db.sqlite "SELECT count(*) FROM user;"
sqlite3 /opt/pangolin/config/db/db.sqlite "SELECT count(*) FROM resources;"
# Numbers should match the primary
```

### 3.7 Continuous DB pull via systemd timer

The standby does NOT run `litestream replicate` (that would push and clobber the primary's data). Instead, a periodic restore loop:

```bash
cat > /usr/local/bin/litestream-pull.sh <<'EOF'
#!/bin/bash
set -euo pipefail

DB=/opt/pangolin/config/db/db.sqlite
CONFIG=/etc/litestream.yml
LOCK=/var/run/litestream-pull.lock

exec 200>"$LOCK"
flock -n 200 || exit 0

# Only restore when Pangolin is NOT running locally
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^pangolin$'; then
    exit 0
fi

rm -f "$DB" "${DB}-wal" "${DB}-shm" "${DB}-journal"
/usr/local/bin/litestream restore -config "$CONFIG" "$DB"
EOF

chmod +x /usr/local/bin/litestream-pull.sh

cat > /etc/systemd/system/litestream-pull.service <<'EOF'
[Unit]
Description=Pull latest Pangolin DB from B2
After=network-online.target docker.service
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/litestream-pull.sh
EOF

cat > /etc/systemd/system/litestream-pull.timer <<'EOF'
[Unit]
Description=Pull Pangolin DB every minute

[Timer]
OnBootSec=30s
OnUnitActiveSec=60s
AccuracySec=5s

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now litestream-pull.timer
```

The script skips pulling when the local Pangolin container is running, so it won't trample writes during an active failover.

### 3.8 Boot the standby once, generate CrowdSec bouncer, then stop

```bash
cd /opt/pangolin
docker compose up -d

# Wait ~60s for everything to come up
sleep 60
docker compose ps

# Verify the wildcard cert was issued by this box
cat config/letsencrypt/acme.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
for resolver, info in data.items():
    for c in info.get('Certificates', []) or []:
        d = c.get('domain', {})
        print(f'  main: {d.get(\"main\")}, sans: {d.get(\"sans\")}')
"
# Expect: main: <DOMAIN>, sans: ['*.<DOMAIN>']
```

Generate the bouncer key:

```bash
docker exec crowdsec cscli bouncers add traefik-bouncer
# Copy the printed API key
```

Edit `/opt/pangolin/config/traefik/dynamic_config.yml`, replace the `crowdsecLapiKey` value with the standby's key.

Edit `/opt/pangolin/config/traefik/traefik_config.yml`, uncomment the crowdsec middleware:

```yaml
      middlewares:
        - crowdsec@file
        - security-headers@file
```

Recreate Traefik to pick up changes:

```bash
docker compose up -d --force-recreate traefik
```

Verify CrowdSec is functional via direct LAPI call:

```bash
docker exec traefik wget -qO- \
  --header="X-Api-Key: $(grep crowdsecLapiKey /opt/pangolin/config/traefik/dynamic_config.yml | awk '{print $2}')" \
  http://crowdsec:8080/v1/decisions
# Should return JSON (possibly empty array, or some default decisions)
```

Stop the stack; DNS still points at primary:

```bash
docker compose down
```

The litestream-pull timer will resume keeping the DB current.

## Phase 4: Failover Automation

### 4.1 Install dependencies and SMTP relay

```bash
apt install -y msmtp msmtp-mta jq curl
```

When prompted by the postinst, **enable** the AppArmor profile (the default profile handles standard `/etc/msmtprc` + `/var/log/msmtp.log` correctly).

Configure msmtp:

```bash
cat > /etc/msmtprc <<EOF
defaults
auth           on
tls            on
tls_trust_file /etc/ssl/certs/ca-certificates.crt

account        default
host           <SMTP_HOST>
port           587
from           <EMAIL>
user           <SMTP_USER>
password       <SMTP_PASS>
EOF

chmod 600 /etc/msmtprc
```

Test:

```bash
echo -e "Subject: standby msmtp test\n\nIf you receive this, msmtp works." | msmtp <EMAIL>
```

> **Note for netcup users**: outbound SMTP is blocked by default. Go to the customer panel → Firewall, delete the "netcup Mail block" default policy, and save. Without this, msmtp will hang.

### 4.2 Find Cloudflare zone and record IDs

```bash
CF_TOKEN="<CF_TOKEN>"
CF_ZONE=$(curl -s "https://api.cloudflare.com/client/v4/zones?name=<DOMAIN>" \
  -H "Authorization: Bearer $CF_TOKEN" | jq -r '.result[0].id')
CF_RECORD=$(curl -s "https://api.cloudflare.com/client/v4/zones/$CF_ZONE/dns_records?type=A&name=<PANGOLIN_HOST>" \
  -H "Authorization: Bearer $CF_TOKEN" | jq -r '.result[0].id')
echo "Zone:   $CF_ZONE"
echo "Record: $CF_RECORD"
```

Save both values.

### 4.3 Failover script

```bash
cat > /usr/local/bin/pangolin-failover.sh <<'BASHEOF'
#!/bin/bash
set -euo pipefail

# --- Configuration ---
PRIMARY_IP="<PRIMARY_IP>"
STANDBY_IP="<STANDBY_IP>"
DOMAIN_RECORD="<PANGOLIN_HOST>"
STATE_DIR="/var/lib/pangolin-failover"
STATE_FILE="$STATE_DIR/failure-count"
TRIGGERED_FILE="$STATE_DIR/failover-triggered"
LOG_FILE="/var/log/pangolin-failover.log"

FAILURE_THRESHOLD=5
TCP_TIMEOUT=5

MAIL_TO="<EMAIL>"
MAIL_FROM="<EMAIL>"

CF_TOKEN="<CF_TOKEN>"
CF_ZONE="<CF_ZONE>"
CF_RECORD="<CF_RECORD>"

PANGOLIN_DIR="/opt/pangolin"
LITESTREAM_PULL="/usr/local/bin/litestream-pull.sh"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify() {
    local subject="$1"
    local body="$2"
    {
        echo "Subject: $subject"
        echo "From: $MAIL_FROM"
        echo "To: $MAIL_TO"
        echo ""
        echo "$body"
    } | msmtp "$MAIL_TO" 2>/dev/null || log "WARNING: failed to send email"
}

check_primary() {
    timeout "$TCP_TIMEOUT" bash -c "exec 3<>/dev/tcp/$PRIMARY_IP/443" 2>/dev/null
}

trigger_failover() {
    log "FAILOVER TRIGGERED: primary unreachable for $FAILURE_THRESHOLD consecutive checks"
    notify "[Pangolin] FAILOVER triggered" \
        "Primary ($PRIMARY_IP) is unreachable after $FAILURE_THRESHOLD consecutive TCP checks. Starting standby and flipping DNS to $STANDBY_IP."

    log "Pulling final DB snapshot from B2..."
    "$LITESTREAM_PULL" && log "Final DB pull successful" || log "WARNING: final DB pull failed"

    log "Starting Pangolin stack on standby..."
    cd "$PANGOLIN_DIR"
    docker compose up -d
    sleep 30

    local health
    health=$(curl -sk -H "Host: $DOMAIN_RECORD" https://localhost/ -o /dev/null -w "%{http_code}" --max-time 10 || echo "000")
    log "Local health check: HTTP $health"

    if [ "$health" = "000" ]; then
        log "ERROR: Pangolin not responding locally; aborting DNS flip"
        notify "[Pangolin] FAILOVER FAILED" "Stack did not become healthy. DNS NOT flipped. Manual intervention required."
        exit 1
    fi

    log "Updating Cloudflare A record $DOMAIN_RECORD -> $STANDBY_IP..."
    local resp success
    resp=$(curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CF_ZONE/dns_records/$CF_RECORD" \
        -H "Authorization: Bearer $CF_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"A\",\"name\":\"$DOMAIN_RECORD\",\"content\":\"$STANDBY_IP\",\"ttl\":60,\"proxied\":false}")
    success=$(echo "$resp" | jq -r '.success')

    if [ "$success" = "true" ]; then
        log "DNS updated successfully"
        touch "$TRIGGERED_FILE"
        notify "[Pangolin] FAILOVER COMPLETE" "DNS flipped to standby. Manual failback required when primary recovers."
    else
        log "ERROR: Cloudflare API call failed: $resp"
        notify "[Pangolin] FAILOVER PARTIAL" "Stack started but DNS flip failed. Manual DNS update required."
        exit 1
    fi
}

mkdir -p "$STATE_DIR"
touch "$LOG_FILE"

# Sticky: once triggered, do nothing until manually reset
[ -f "$TRIGGERED_FILE" ] && exit 0

count=0
[ -f "$STATE_FILE" ] && count=$(cat "$STATE_FILE")

if check_primary; then
    [ "$count" -gt 0 ] && log "Primary reachable again (was at $count/$FAILURE_THRESHOLD)"
    echo "0" > "$STATE_FILE"
    exit 0
fi

count=$((count + 1))
echo "$count" > "$STATE_FILE"
log "Primary unreachable (failure $count/$FAILURE_THRESHOLD)"

[ "$count" -ge "$FAILURE_THRESHOLD" ] && trigger_failover
BASHEOF

chmod 700 /usr/local/bin/pangolin-failover.sh
```

### 4.4 systemd timer

```bash
cat > /etc/systemd/system/pangolin-failover.service <<'EOF'
[Unit]
Description=Pangolin HA failover monitor
After=network-online.target docker.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/pangolin-failover.sh
EOF

cat > /etc/systemd/system/pangolin-failover.timer <<'EOF'
[Unit]
Description=Run Pangolin failover check every minute

[Timer]
OnBootSec=2min
OnUnitActiveSec=60s
AccuracySec=10s

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now pangolin-failover.timer
systemctl list-timers pangolin-failover.timer --no-pager
```

Verify it fires silently while the primary is healthy:

```bash
/usr/local/bin/pangolin-failover.sh
cat /var/lib/pangolin-failover/failure-count
# Should be 0
```

## Phase 5: Failback Script

The failback script runs on the **primary** after it recovers. It coordinates a controlled handover that preserves any writes that happened on the standby during failover.

### 5.1 SSH key from primary to standby

The failback script SSHes into the standby to stop Pangolin and reset the failover trigger:

```bash
# On primary
ssh-keygen -t ed25519 -N "" -f /root/.ssh/id_ed25519
ssh-copy-id root@<STANDBY_IP>

# Verify passwordless login
ssh -o BatchMode=yes root@<STANDBY_IP> "hostname"
```

### 5.2 Failback script

```bash
cat > /usr/local/bin/pangolin-failback.sh <<'BASHEOF'
#!/bin/bash
set -euo pipefail

PRIMARY_IP="<PRIMARY_IP>"
STANDBY_IP="<STANDBY_IP>"
STANDBY_SSH="root@${STANDBY_IP}"
DOMAIN_RECORD="<PANGOLIN_HOST>"
PANGOLIN_DIR="/opt/pangolin"
LITESTREAM_CONFIG="/etc/litestream.yml"
PANGOLIN_DB="/opt/pangolin/config/db/db.sqlite"

CF_TOKEN="<CF_TOKEN>"
CF_ZONE="<CF_ZONE>"
CF_RECORD="<CF_RECORD>"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

confirm() {
    read -r -p "$1 [type YES to continue]: " answer
    [ "$answer" = "YES" ] || { echo "Aborted."; exit 1; }
}

log "===== Pangolin failback: standby -> primary ====="
log "Service interruption: 2-5 minutes."
confirm "Proceed with failback?"

log "Step 1/6: Stopping Pangolin on standby..."
ssh -o StrictHostKeyChecking=no "$STANDBY_SSH" "cd $PANGOLIN_DIR && docker compose down"

log "Step 2/6: Pushing standby DB to B2..."
ssh -o StrictHostKeyChecking=no "$STANDBY_SSH" \
    "timeout 60 litestream replicate -config /etc/litestream.yml -exec 'sleep 30'" || true

log "Step 3/6: Restoring DB on primary..."
systemctl stop litestream
cd "$PANGOLIN_DIR"
docker compose down 2>/dev/null || true
rm -f "$PANGOLIN_DB" "${PANGOLIN_DB}-wal" "${PANGOLIN_DB}-shm" "${PANGOLIN_DB}-journal"
litestream restore -config "$LITESTREAM_CONFIG" "$PANGOLIN_DB"

log "Step 4/6: Starting Pangolin on primary..."
docker compose up -d
sleep 30
health=$(curl -sk -H "Host: $DOMAIN_RECORD" https://localhost/ -o /dev/null -w "%{http_code}" --max-time 10 || echo "000")
log "Local health check: HTTP $health"
[ "$health" = "000" ] && { log "ERROR: primary not healthy"; exit 1; }

log "Step 5/6: Resuming Litestream on primary..."
systemctl start litestream

log "Step 6/6: Flipping DNS back to primary..."
resp=$(curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$CF_ZONE/dns_records/$CF_RECORD" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"A\",\"name\":\"$DOMAIN_RECORD\",\"content\":\"$PRIMARY_IP\",\"ttl\":60,\"proxied\":false}")
[ "$(echo "$resp" | jq -r '.success')" = "true" ] || { log "ERROR: DNS update failed: $resp"; exit 1; }

log "Resetting standby failover trigger..."
ssh -o StrictHostKeyChecking=no "$STANDBY_SSH" \
    "rm -f /var/lib/pangolin-failover/failover-triggered /var/lib/pangolin-failover/failure-count"

log "===== Failback complete ====="
log "DNS may take 1-2 minutes to propagate globally."
BASHEOF

chmod 700 /usr/local/bin/pangolin-failback.sh
```

Syntax check:

```bash
bash -n /usr/local/bin/pangolin-failback.sh && echo "OK"
```

## Operations

### Normal state

- Primary's Pangolin stack runs, Litestream pushes to B2 every second
- Standby's stack is stopped, litestream-pull restores from B2 every 60s
- Failover monitor on standby probes primary every 60s

### When primary fails

The failover monitor takes over automatically after ~5 minutes:

1. You receive an email: `[Pangolin] FAILOVER triggered`
2. Standby pulls final DB, starts Pangolin stack
3. DNS flips to standby
4. You receive: `[Pangolin] FAILOVER COMPLETE`
5. Failover is sticky; standby won't flip back automatically

### When primary recovers

Run failback on the primary:

```bash
ssh root@<PRIMARY_IP>
/usr/local/bin/pangolin-failback.sh
# Type YES to confirm
```

Standby's failover trigger is reset; system is back to normal state.

## Operational Notes

### Architectural Trade-offs

**Detection threshold (TCP-on-443):**
The failover check is intentionally lenient. It only triggers on full network/host outages, not on application-level failures. A crashed Pangolin behind a healthy Traefik passes the TCP check. Tighten the check by replacing `check_primary` with an HTTP probe if you need that:

```bash
# Stricter HTTP-level check (replaces check_primary function body)
curl -sk -H "Host: <PANGOLIN_HOST>" "https://$PRIMARY_IP/" \
    --max-time "$TCP_TIMEOUT" -o /dev/null -w "%{http_code}\n" | grep -qE "^(200|307|401)$"
```

**Split-brain risk:**
If the standby reaches the primary differently from real users (e.g. the primary is reachable from clients but not from the standby's network path), the standby will failover while the primary continues serving traffic. Mitigations are built in: sticky failover, manual failback, Litestream's last-writer-wins semantics. This is fundamentally a CAP-theorem trade-off and cannot be eliminated, only made unlikely.

**DNS TTL floor:**
With TTL set to 60s in the API call, clients with cached records may keep hitting the old primary for up to a minute after the flip. Most browsers respect the new record within seconds, but some recursive resolvers and stale session cookies will lag.

**EE licensing:**
Pangolin's EE license is one-per-server. Running both nodes on EE requires two licenses or running the standby on CE (`fosrl/pangolin:<version>` without the `ee-` prefix). The CE binary boots from the same DB but EE-only features (SSO, audit logs, advanced RBAC) are inactive until you activate a key.

### Maintenance Windows

Before any disruptive work on the primary (reboots, kernel updates, image upgrades):

```bash
# On standby: pause the failover monitor
systemctl stop pangolin-failover.timer

# ... do maintenance on primary ...

# On standby: resume
systemctl start pangolin-failover.timer

# Reset failure counter if any partial checks accumulated
echo "0" > /var/lib/pangolin-failover/failure-count
```

### Manual Failover Test

Run a real failover quarterly to verify the system still works:

```bash
# On primary: simulate Traefik outage (TCP 443 stops answering)
docker compose -f /opt/pangolin/docker-compose.yml stop traefik gerbil

# Wait ~5 minutes, verify:
# 1. Email arrives: [Pangolin] FAILOVER COMPLETE
# 2. DNS now returns standby IP
dig +short <PANGOLIN_HOST>
# 3. Standby is serving:
curl -sI https://<PANGOLIN_HOST>/

# Restore primary:
docker compose -f /opt/pangolin/docker-compose.yml start gerbil traefik

# Run failback:
/usr/local/bin/pangolin-failback.sh
```

## Troubleshooting

### Common Issues

**Wildcard cert still shows single domain after DNS-01 switch:**

```bash
# Verify config actually changed (not just edited but not reloaded)
grep -A6 "dnsChallenge:" /opt/pangolin/config/traefik/traefik_config.yml
grep -A8 "^tls:" /opt/pangolin/config/traefik/dynamic_config.yml

# Both must return non-empty content. If they do, Traefik is running stale config:
echo "{}" > /opt/pangolin/config/letsencrypt/acme.json
docker compose up -d --force-recreate traefik
docker logs -f traefik 2>&1 | grep -iE 'acme|cloudflare|certif'
```

**Traefik logs show `Cannot retrieve the ACME challenge` with no Cloudflare calls:**

The `CLOUDFLARE_DNS_API_TOKEN` env var isn't reaching the container, so Traefik falls back to TLS-ALPN.

```bash
# Confirm token is in the container
docker exec traefik env | grep CLOUDFLARE

# If empty: the compose file's `environment` block isn't formatted correctly,
# or you edited it without restarting the container.
docker compose config | grep -i cloudflare    # shows resolved values
docker compose up -d --force-recreate traefik
```

**Litestream restore fails: `cannot restore, output path already exists`:**

```bash
# Litestream refuses to overwrite. Delete the target file (including WAL/SHM) first:
rm -f /opt/pangolin/config/db/db.sqlite \
      /opt/pangolin/config/db/db.sqlite-wal \
      /opt/pangolin/config/db/db.sqlite-shm \
      /opt/pangolin/config/db/db.sqlite-journal
litestream restore -config /etc/litestream.yml /opt/pangolin/config/db/db.sqlite
```

**Litestream commands "unknown command" (snapshots / ls):**

```bash
# Litestream 0.5.x renamed subcommands. The relevant ones for inspection:
litestream ltx -config /etc/litestream.yml /opt/pangolin/config/db/db.sqlite
litestream databases -config /etc/litestream.yml
litestream --help
```

**`wget` for Litestream gets 404 with empty version in URL:**

```bash
# Variable didn't carry to a new shell. Chain everything in one command:
LITESTREAM_VERSION=0.5.11 && \
cd /tmp && \
wget "https://github.com/benbjohnson/litestream/releases/download/v${LITESTREAM_VERSION}/litestream-${LITESTREAM_VERSION}-linux-x86_64.tar.gz"
```

**Sessions invalidated / Newt connectors fail after failover:**

The standby's `server.secret` or `config/key` doesn't match the primary. Verify both:

```bash
# On both boxes, output must be identical:
sha256sum /opt/pangolin/config/config.yml /opt/pangolin/config/key
```

If they differ, copy from primary to standby (after stopping both stacks), restart.

**CrowdSec self-triggers a ban during normal dashboard use:**

The `LePresidente/http-generic-403-bf` scenario in the recommended Pangolin CrowdSec collection treats authenticated dashboard 403s (permission probes by the SPA) as brute-force probing. Symptom: changing page size in the resources view or similar action triggers a captcha/ban on your own IP.

```bash
# Immediate fix:
docker exec crowdsec cscli decisions delete --ip <YOUR_IP>

# Long-term fix: post-overflow whitelist for the dashboard host. Inside the
# crowdsec container at /etc/crowdsec/postoverflows/s01-whitelist/pangolin.yaml:
name: dnet/pangolin-dashboard-whitelist
description: "Don't ban authenticated Pangolin dashboard users"
whitelist:
  reason: "Pangolin dashboard authenticated traffic"
  expression:
    - evt.Meta.http_path startsWith '/api/v1/' && evt.Meta.http_host == '<PANGOLIN_HOST>'
```

**msmtp hangs / outbound SMTP blocked (netcup):**

netcup blocks outbound 25/465/587 by default via the customer firewall.

```bash
# Verify it's blocked:
timeout 5 bash -c 'cat < /dev/tcp/smtp.example.com/587' && echo OK || echo BLOCKED

# Fix: netcup customer panel (CCP) → VPS card → Firewall →
# delete "netcup Mail block" default policy → Speichern.
# IONOS has no equivalent default block.
```

**msmtp "Permission denied" writing to logfile:**

AppArmor's default msmtp profile restricts log paths. Easiest fix is to drop the logfile directive entirely; the systemd journal captures the same output:

```bash
sed -i '/^logfile/d' /etc/msmtprc
```

**Failover triggers but stack doesn't come up on standby:**

```bash
# Check what happened:
journalctl -u pangolin-failover.service --no-pager -n 50
cat /var/log/pangolin-failover.log

# Manually verify standby can start the stack:
cd /opt/pangolin
docker compose up -d
docker compose ps
```

Most common cause: standby's Docker images aren't pulled yet, or a port is in use by something else.

**Cloudflare API returns `success: false` during failover:**

```bash
# Get the full error:
CF_TOKEN=$(grep '^CF_TOKEN=' /usr/local/bin/pangolin-failover.sh | cut -d'"' -f2)
CF_ZONE=$(grep '^CF_ZONE=' /usr/local/bin/pangolin-failover.sh | cut -d'"' -f2)
CF_RECORD=$(grep '^CF_RECORD=' /usr/local/bin/pangolin-failover.sh | cut -d'"' -f2)
curl -s "https://api.cloudflare.com/client/v4/zones/$CF_ZONE/dns_records/$CF_RECORD" \
  -H "Authorization: Bearer $CF_TOKEN" | jq

# Common causes:
# - Token expired or revoked
# - Token scope no longer includes the zone
# - Zone or record ID changed (e.g. you deleted and recreated the record)
```

If the API is unreachable mid-failover, flip DNS manually:

```bash
# Cloudflare dashboard → DNS → edit pangolin record → change IP to standby
# Or via curl from any other host with internet access:
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/<CF_ZONE>/dns_records/<CF_RECORD>" \
  -H "Authorization: Bearer <CF_TOKEN>" \
  -H "Content-Type: application/json" \
  --data '{"type":"A","name":"<PANGOLIN_HOST>","content":"<STANDBY_IP>","ttl":60,"proxied":false}'
```

**Failback fails at "Pushing standby DB to B2":**

The standby stopped writing to B2 during failover (only the primary normally pushes). The failback script's exec-style replicate may not complete cleanly. Workaround:

```bash
# On standby, manually push current DB to B2 before continuing failback:
litestream replicate -config /etc/litestream.yml &
LS_PID=$!
sleep 30
kill $LS_PID
# Then re-run pangolin-failback.sh on the primary
```

**Standby restored DB is empty or stale:**

```bash
# Verify litestream-pull is actually running on the standby:
systemctl status litestream-pull.timer
journalctl -u litestream-pull -n 20

# Force a manual restore:
docker ps --format '{{.Names}}' | grep -q pangolin && \
    { echo "Stop Pangolin first"; exit 1; }
/usr/local/bin/litestream-pull.sh

# Verify content:
sqlite3 /opt/pangolin/config/db/db.sqlite "SELECT count(*) FROM user;"
```

**`server.secret` was generated by the install script on the standby:**

If you ran the Pangolin install script on the standby (instead of bootstrapping from the primary's config), the secret won't match. Stop the standby, copy `config/config.yml` and `config/key` from primary, restart. Existing user sessions and Newt connectors will then validate correctly after failover.

### Useful Inspection Commands

```bash
# Current Cloudflare A record value
CF_TOKEN="<CF_TOKEN>" CF_ZONE="<CF_ZONE>" CF_RECORD="<CF_RECORD>"
curl -s "https://api.cloudflare.com/client/v4/zones/$CF_ZONE/dns_records/$CF_RECORD" \
  -H "Authorization: Bearer $CF_TOKEN" | jq '.result | {name, content, ttl}'

# Litestream replication status
litestream ltx -config /etc/litestream.yml /opt/pangolin/config/db/db.sqlite

# Last failover check result
cat /var/lib/pangolin-failover/failure-count
ls -la /var/lib/pangolin-failover/failover-triggered  # exists = sticky-locked

# Recent failover monitor activity
journalctl -u pangolin-failover --since "1 hour ago" --no-pager

# DB content comparison (run on both boxes, output should match within 60s)
sqlite3 /opt/pangolin/config/db/db.sqlite \
  "SELECT count(*) FROM user; SELECT count(*) FROM resources; SELECT count(*) FROM sites;"
```

### Resetting State

**Reset standby after manual recovery (when failback script can't run):**

```bash
# On standby:
cd /opt/pangolin
docker compose down
rm -f /var/lib/pangolin-failover/failover-triggered
rm -f /var/lib/pangolin-failover/failure-count
systemctl restart litestream-pull.timer pangolin-failover.timer
```

**Roll back to a Litestream snapshot from earlier:**

```bash
# List available snapshots with timestamps:
litestream ltx -config /etc/litestream.yml /opt/pangolin/config/db/db.sqlite

# Restore to a specific point in time:
docker compose -f /opt/pangolin/docker-compose.yml down
rm -f /opt/pangolin/config/db/db.sqlite*
litestream restore -config /etc/litestream.yml \
    -timestamp 2026-05-13T08:30:00Z \
    /opt/pangolin/config/db/db.sqlite
docker compose -f /opt/pangolin/docker-compose.yml up -d
```

---

**Important:** Replace all placeholder values (`<...>`) with actual configuration before deployment. Failover automation modifies live DNS and infrastructure; test in a controlled environment first.

**Upstream documentation:** https://docs.pangolin.net/
**Pangolin GitHub:** https://github.com/fosrl/pangolin
**Litestream:** https://litestream.io/

#!/bin/bash
# crowdsec-home.sh (cron, every 30 min): keep the home line on CrowdSec's allowlist "home", so newt's tunnel
# and every device at home are never banned. Source: the endpoint of the newt site in Pangolin's database
# (updated by Pangolin on every hole punch), not DNS. The home line sits behind carrier-grade NAT, so a DNS name for it would be useless.
set -uo pipefail
DB=/opt/pangolin/config/db/db.sqlite
ep=$(sqlite3 -readonly "$DB" "SELECT endpoint FROM sites WHERE type='newt' AND online=1 ORDER BY lastHolePunch DESC LIMIT 1;")
IP=${ep%:*}
[[ "$IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]] || { echo "crowdsec-home: no IPv4 endpoint for the newt site (got '$ep')" >&2; exit 1; }
docker exec crowdsec cscli allowlists inspect home >/dev/null 2>&1 ||
  docker exec crowdsec cscli allowlists create home -d "home line (newt endpoint from Pangolin)" >/dev/null
docker exec crowdsec cscli allowlists add home "$IP" -e 3h >/dev/null
docker exec crowdsec cscli decisions delete --ip "$IP" >/dev/null 2>&1 || true

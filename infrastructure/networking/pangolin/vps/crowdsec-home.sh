#!/bin/bash
# crowdsec-home.sh (cron, every 30 min): keep the home line on CrowdSec's allowlist "home", so newt's tunnel
# and every device at home are never banned. Source: the endpoint of the newt site in Pangolin's database
# (updated by Pangolin on every hole punch), not DNS. Silent when all is well: cron mails any output.
set -uo pipefail
DB=/opt/pangolin/config/db/db.sqlite
ep=$(sqlite3 -readonly "$DB" "SELECT endpoint FROM sites WHERE type='newt' AND online=1 ORDER BY lastHolePunch DESC LIMIT 1;" 2>/dev/null)
IP=${ep%:*}
if ! [[ "$IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
  # tunnel down: the last entry stays valid for up to 3 h, nothing to mail about
  logger -t crowdsec-home "no IPv4 endpoint for the newt site (got '$ep'), allowlist unchanged"
  exit 0
fi
cs() { docker exec crowdsec cscli "$@"; }
cs allowlists inspect home >/dev/null 2>&1 || cs allowlists create home -d "home line (newt endpoint from Pangolin)" >/dev/null 2>&1
# remove first: "add" on an existing value only warns and does not extend its expiry
cs allowlists remove home "$IP" >/dev/null 2>&1
if ! out=$(cs allowlists add home "$IP" -e 3h 2>&1); then
  echo "crowdsec-home: adding $IP to the allowlist failed: $out"
  exit 1
fi
cs decisions delete --ip "$IP" >/dev/null 2>&1 || true

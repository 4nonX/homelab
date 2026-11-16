#!/bin/bash
# set-postdeploy.sh: sets post_deploy = "bash ../../platform/docker-vm/komodo-postdeploy <stack>" on every Komodo stack that does not have a
# post_deploy command yet (existing ones are left alone). Run once, anywhere that reaches Komodo Core.
#   KOMODO_URL=http://komodo.lan:9120 KOMODO_API_KEY=... KOMODO_API_SECRET=... bash set-postdeploy.sh [--dry-run]
# Needs an API key of a user with write access to stacks (the bao-watch key can only execute).
# Afterwards refresh resources.toml (ExportAllResourcesToToml) and commit it.
set -euo pipefail
: "${KOMODO_URL:?}" "${KOMODO_API_KEY:?}" "${KOMODO_API_SECRET:?}"
DRY=0; [ "${1:-}" = --dry-run ] && DRY=1
api() { curl -fsS -X POST -H "Content-Type: application/json" -H "X-Api-Key: $KOMODO_API_KEY" \
          -H "X-Api-Secret: $KOMODO_API_SECRET" -d "$2" "$KOMODO_URL/$1"; }

for s in $(api read/ListStacks '{}' | jq -r '.[].name' | sort); do
  cur=$(api read/GetStack "$(jq -n --arg s "$s" '{stack: $s}')" | jq -r '.config.post_deploy.command // "" | gsub("\\s"; "")')
  if [ -n "$cur" ]; then echo "$s: keeps post_deploy ($cur)"; continue; fi
  if [ "$DRY" = 1 ]; then echo "$s: would set post_deploy"; continue; fi
  api write/UpdateStack "$(jq -n --arg s "$s" '{id: $s, config: {post_deploy: {command: ("bash ../../platform/docker-vm/komodo-postdeploy " + $s), shell_mode: false}}}')" >/dev/null
  echo "$s: post_deploy set"
done

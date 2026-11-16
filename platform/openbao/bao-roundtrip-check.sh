#!/bin/bash
# Render every stack .env from OpenBao into a temp dir and compare the values compose actually sees.
# Compares against the .env files in Komodo s clone (rendered there by komodo-predeploy).
set -u
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT; n=0; ok=0
bao-render-env --out "$T" >/dev/null 2>&1   # writes $T/<stack>/.env for every stack in Bao
for d in /srv/local/komodo/repos/gitops/stacks/*/; do
  p=$(basename "$d"); [ -f "$d/.env" ] || continue
  [ -f "$T/$p/.env" ] || { echo "  $p: not rendered"; n=$((n+1)); continue; }
  # parse both files with docker compose itself (same dotenv rules as a deploy)
  a=$(cd "$d" && docker compose --env-file "$d/.env" config --format json 2>/dev/null | sha256sum)
  b=$(cd "$d" && docker compose --env-file "$T/$p/.env" config --format json 2>/dev/null | sha256sum)
  e=$(echo -n | sha256sum)
  if [ "$a" != "$e" ] && [ "$a" = "$b" ]; then ok=$((ok+1)); else echo "  $p: rendered config differs"; n=$((n+1)); fi
done
echo "Bao round-trip: $ok stacks identical, $n differ"

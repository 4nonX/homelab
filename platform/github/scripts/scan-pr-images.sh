#!/bin/bash
# scan-pr-images.sh <pr-number> [...]: Trivy check of every image a pull request changes in a compose file.
# Each new image is compared with the image it replaces (same file, same repository): only CRITICAL CVEs with a
# fix that the new image has and the old one did not count. Findings the running image already has do not turn
# the PR red; a newly added image counts in full. Result on the PR's head commit as status "trivy / critical".
# Needs GH_TOKEN, GITHUB_REPOSITORY, trivy and jq.
set -uo pipefail
CACHE=$(mktemp -d); trap 'rm -rf "$CACHE"' EXIT

# repository of an image reference, without digest, tag and the default docker.io/library prefixes
repo() { local r=${1%%@*}; [[ "${r##*/}" == *:* ]] && r=${r%:*}; r=${r#docker.io/}; r=${r#library/}; echo "$r"; }

# CRITICAL CVE ids (with a fix) of an image, one per line; cached; exit 2 on scan error
cves() {
  local f="$CACHE/$(printf '%s' "$1" | sha256sum | cut -c1-16)"
  if [ ! -f "$f" ]; then
    trivy image --quiet --no-progress --scanners vuln --severity CRITICAL --ignore-unfixed --format json "$1" >"$f.json" ||
      { rm -f "$f.json"; return 2; }
    jq -r '[.Results[]?.Vulnerabilities[]?.VulnerabilityID] | unique | .[]' "$f.json" >"$f"
  fi
  cat "$f"
}

# "file<TAB>old<TAB>new" for every changed image line of the diff; old is empty for an added image
pairs() {
  git diff "$1" -- 'stacks/*/compose.yaml' 'platform/*/compose.yaml' | awk '
    /^\+\+\+ / { file = substr($2, 3); next }
    /^--- /    { next }
    /^[-+][[:space:]]+image:/ {
      sign = substr($0, 1, 1); ref = $0
      sub(/^[-+][[:space:]]+image:[[:space:]]*"?/, "", ref); sub(/["[:space:]#].*$/, "", ref)
      if (ref ~ /\$/) next
      if (sign == "-") old[file] = old[file] " " ref; else new[file] = new[file] " " ref
    }
    END { for (f in new) { n = split(new[f], a, " "); for (i = 1; i <= n; i++) print f "\t" old[f] "\t" a[i] } }' |
    sort -u
}

rc_all=0
for pr in "$@"; do
  read -r head base < <(gh pr view "$pr" --json headRefOid,baseRefName -q '.headRefOid + " " + .baseRefName')
  git fetch -q origin "$base" "+refs/pull/$pr/head:refs/remotes/pr/$pr"
  status=success; bad=(); n=0
  while IFS=$'\t' read -r file olds img; do
    [ -n "$img" ] || continue
    n=$((n + 1)); old=""
    for o in $olds; do [ "$(repo "$o")" = "$(repo "$img")" ] && { old=$o; break; }; done
    echo "::group::PR #$pr $file: ${old:-(new image)} -> $img"
    if ! newc=$(cves "$img"); then echo "scan failed: $img"; bad+=("$(repo "$img"): scan error"); [ "$status" = success ] && status=error; echo "::endgroup::"; continue; fi
    oldc=""
    if [ -n "$old" ]; then
      if ! oldc=$(cves "$old"); then echo "old image not scannable, counting all findings: $old"; oldc=""; fi
    fi
    added=$(comm -13 <(echo "$oldc" | sed '/^$/d' | sort -u) <(echo "$newc" | sed '/^$/d' | sort -u))
    echo "CRITICAL with fix: old $(echo "$oldc" | sed '/^$/d' | wc -l), new $(echo "$newc" | sed '/^$/d' | wc -l), introduced: ${added:-none}"
    if [ -n "$added" ]; then
      status=failure; bad+=("$(repo "$img"): $(echo $added | tr ' ' ',')")
      trivy image --quiet --no-progress --scanners vuln --severity CRITICAL --ignore-unfixed "$img" 2>/dev/null | grep -F -f <(echo "$added") || true
    fi
    echo "::endgroup::"
  done < <(pairs "origin/$base...$head")

  if [ "$n" -eq 0 ]; then desc="no changed images"
  elif [ ${#bad[@]} -eq 0 ]; then desc="$n image(s), no new CRITICAL"
  else desc="$(printf '%s; ' "${bad[@]}")"; desc="new CRITICAL: ${desc%; }"; fi
  echo "PR #$pr: $status: $desc"
  [ "$status" = success ] || rc_all=1
  gh api -X POST "repos/$GITHUB_REPOSITORY/statuses/$head" -f state="$status" -f context="trivy / critical" \
    -f description="${desc:0:140}" -f target_url="$GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID" >/dev/null
done
exit $rc_all

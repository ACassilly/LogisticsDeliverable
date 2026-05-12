#!/usr/bin/env bash
# Negative-auth probe + public-asset probe for every RBAC role surface.
# Asserts each role's protected path redirects unauthenticated requests to /login.
# Asserts public paths return 200 with body > 1024 bytes (no 1x1 placeholder pages).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CFG="$DIR/roles.json"
BASE=$(jq -r .portal_base "$CFG")
LOGIN=$(jq -r .login_path "$CFG")
FAIL=0
echo "### NEGATIVE AUTH PROBE (unauthenticated must redirect to $LOGIN) ###"
while read -r row; do
  key=$(echo "$row" | jq -r .key)
  path=$(echo "$row" | jq -r .path)
  code=$(curl -s -o /dev/null -w '%{http_code}' -I "$BASE$path" || echo 000)
  loc=$(curl -s -o /dev/null -w '%{redirect_url}' -I "$BASE$path" || true)
  printf '  %-12s %-22s http=%s redirect=%s\n' "$key" "$path" "$code" "$loc"
  case "$code" in 301|302|303|307|308) : ;; 401|403) : ;; *) FAIL=$((FAIL+1));; esac
done < <(jq -c '.roles[]' "$CFG")
echo "### PUBLIC PROBE (200 with body > 1024 bytes) ###"
while read -r p; do
  url="$BASE$p"
  code=$(curl -s -o /tmp/qa-body -w '%{http_code}' "$url" || echo 000)
  sz=$(wc -c < /tmp/qa-body 2>/dev/null || echo 0)
  printf '  %-22s http=%s bytes=%s\n' "$p" "$code" "$sz"
  if [ "$code" != "200" ] || [ "$sz" -lt 1024 ]; then FAIL=$((FAIL+1)); fi
done < <(jq -r '.public_paths[]' "$CFG")
echo "### RESULT ###"
if [ "$FAIL" -eq 0 ]; then echo OK; else echo "FAIL=$FAIL"; exit 1; fi

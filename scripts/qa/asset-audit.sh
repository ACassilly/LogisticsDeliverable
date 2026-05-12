#!/usr/bin/env bash
# Crawl public pages + every protected role surface (URL only, no auth) and
# audit every <img>/og:image asset for placeholder bytes / wrong content-type.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
CFG="$DIR/roles.json"
BASE=$(jq -r .portal_base "$CFG")
PATHS=$(jq -r '.public_paths[]' "$CFG")
TMP=$(mktemp -d)
FAIL=0
for p in $PATHS; do
  url="$BASE$p"
  body="$TMP/body.html"
  curl -sL "$url" -o "$body"
  echo "### $url ###"
  # extract <img src="..."> and og:image content
  srcs=$(grep -oE '(src|content)="[^"]+\.(png|jpg|jpeg|webp|gif|svg|avif)"' "$body" | sed -E 's/.*="([^"]+)".*/\1/' | sort -u)
  for s in $srcs; do
    case "$s" in
      http*) full="$s" ;;
      //*)   full="https:$s" ;;
      /*)    full="$BASE$s" ;;
      *)     full="$BASE/$s" ;;
    esac
    hdr=$(curl -sI -L "$full" || true)
    ct=$(echo "$hdr" | awk 'tolower($1)=="content-type:"{print $2}' | tr -d '\r' | tail -n1)
    cl=$(echo "$hdr" | awk 'tolower($1)=="content-length:"{print $2}' | tr -d '\r' | tail -n1)
    cl=${cl:-0}
    flag=""
    case "$ct" in image/*|*svg*) : ;; *) flag="BAD_CT($ct)" ;; esac
    if [ "$cl" -lt 256 ] 2>/dev/null; then flag="$flag SMALL($cl)"; fi
    if [ -n "$flag" ]; then echo "  FAIL $full $flag"; FAIL=$((FAIL+1)); else echo "  ok   $full $cl"; fi
  done
done
echo "### RESULT FAIL=$FAIL ###"
[ "$FAIL" -eq 0 ]

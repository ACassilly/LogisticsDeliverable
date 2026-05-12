#!/usr/bin/env bash
# Robust asset audit: extract every image-ish URL from each public page and
# verify each one returns image/* with body >= 256 bytes. Tolerant of missing
# Content-Length (chunked CDNs), Next/image proxy URLs, and srcset attrs.
set -uo pipefail  # NOTE: no -e -- we want to keep going on per-asset failures
DIR="$(cd "$(dirname "$0")" && pwd)"
CFG="$DIR/roles.json"
BASE=$(jq -r .portal_base "$CFG")
PATHS=$(jq -r '.public_paths[]' "$CFG")
TMP=$(mktemp -d)
FAIL=0; TOTAL=0
for p in $PATHS; do
  url="$BASE$p"
  body="$TMP/body.html"
  curl -sL --max-time 30 "$url" -o "$body" || { echo "### FETCH_FAIL $url ###"; FAIL=$((FAIL+1)); continue; }
  echo "### $url ###"
  # Pull all *image-like* URLs: <img src=>, <img srcset=>, <source srcset=>,
  # <meta property=og:image content=>, and Next.js _next/image?url=...
  srcs=$(grep -oE '(src|srcset|content)="[^"]+"' "$body" \
        | sed -E 's/.*="([^"]+)".*/\1/' \
        | sed 's/&amp;/\&/g' \
        | tr ',' '\n' \
        | awk '{print $1}' \
        | grep -Ei '\.(png|jpe?g|webp|gif|svg|avif)([?#]|$)|/_next/image\?' \
        | sort -u)
  for s in $srcs; do
    TOTAL=$((TOTAL+1))
    case "$s" in
      http*) full="$s" ;;
      //*)   full="https:$s" ;;
      /*)    full="$BASE$s" ;;
      *)     full="$BASE/$s" ;;
    esac
    # follow redirects; pull HTTP code, content-type, content-length
    out=$(curl -s -L --max-time 30 -o /dev/null -w '%{http_code}|%{content_type}|%{size_download}' "$full" || true)
    code=$(echo "$out" | cut -d'|' -f1)
    ct=$(echo "$out" | cut -d'|' -f2)
    sz=$(echo "$out" | cut -d'|' -f3)
    sz=${sz:-0}
    flags=""
    [ "$code" = "200" ] || flags="$flags HTTP=$code"
    case "$ct" in image/*|*svg*) : ;; *) flags="$flags CT=$ct" ;; esac
    if [ "${sz:-0}" -lt 256 ] 2>/dev/null; then flags="$flags SMALL=$sz"; fi
    if [ -n "$flags" ]; then echo "  FAIL $full$flags"; FAIL=$((FAIL+1));
    else echo "  ok   $full sz=$sz ct=$ct"; fi
  done
done
echo "### RESULT pages=$(echo "$PATHS" | wc -l) assets=$TOTAL fails=$FAIL ###"
exit 0  # never block CI on this -- it's an audit

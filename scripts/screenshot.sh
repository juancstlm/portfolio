#!/usr/bin/env bash
# Capture a screenshot of a URL into public/images/projects/<slug>-1.png.
# Usage: scripts/screenshot.sh <slug> <url> [width=1440] [height=900] [wait_ms=8000]
# wait_ms uses Chrome's virtual time budget so JS frameworks have time to render
# (the page is captured once that budget elapses or the renderer goes idle).
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "usage: $0 <slug> <url> [width=1440] [height=900] [wait_ms=8000]" >&2
  exit 1
fi

SLUG="$1"
URL="$2"
WIDTH="${3:-1440}"
HEIGHT="${4:-900}"
WAIT_MS="${5:-8000}"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -x "$CHROME" ]; then
  echo "Chrome not found at: $CHROME" >&2
  exit 1
fi

OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/images/projects"
mkdir -p "$OUT_DIR"
OUT="$OUT_DIR/${SLUG}-1.png"

"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --window-size="${WIDTH},${HEIGHT}" \
  --virtual-time-budget="${WAIT_MS}" \
  --run-all-compositor-stages-before-draw \
  --screenshot="$OUT" \
  "$URL" >/dev/null 2>&1

if [ ! -s "$OUT" ]; then
  echo "screenshot failed: $OUT is missing or empty" >&2
  exit 1
fi

echo "$OUT"

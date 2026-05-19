#!/usr/bin/env bash
# Builda o edge script e garante que o bundle ficou ≤1MB (limite Bunny).
# Falha o deploy automaticamente se exceder — não precisa checar manualmente.
set -euo pipefail

ENTRY="src/index.ts"
OUTFILE="dist/index.js"
MAX_BYTES=1048576  # 1MB exato

mkdir -p dist

echo "→ Typechecking..."
npx tsc --noEmit

echo "→ Building..."
npx esbuild "$ENTRY" \
  --bundle \
  --platform=browser \
  --format=esm \
  --target=es2022 \
  --outfile="$OUTFILE" \
  --minify \
  --legal-comments=none

# stat -f no macOS, stat -c no Linux
SIZE=$(stat -f%z "$OUTFILE" 2>/dev/null || stat -c%s "$OUTFILE")
echo "→ Bundle: ${SIZE} bytes / ${MAX_BYTES} bytes (1MB limit)"

if [ "$SIZE" -gt "$MAX_BYTES" ]; then
  echo "✗ Bundle excedeu 1MB — deploy abortado. Reduza dependências ou use tree-shaking."
  rm -f "$OUTFILE"
  exit 1
fi

echo "✓ Build OK — $(( SIZE / 1024 ))KB usado de 1024KB disponíveis"

#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

echo "=== 1. Login en GitHub ==="
gh auth status 2>/dev/null || gh auth login -h github.com -p https -w

echo ""
echo "=== 2. Crear repo y subir ==="
gh repo create TRUSTTAXVA --public --source=. --remote=origin --push --description "TrustTax VA - Professional tax preparation and immigration services platform"

echo ""
echo "✅ Repo creado y código subido: https://github.com/$(gh api user -q .login)/TRUSTTAXVA"

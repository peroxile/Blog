#!/usr/bin/env bash
# digest.sh
# Reads secrets from environment variables — safe to commit publicly.
# Run via cron (GitHub Actions schedule) or locally with exported vars:
#   export TG_TOKEN=... TG_CHAT_ID=... && ./digest.sh

set -euo pipefail

# Require secrets 
TG_TOKEN="${TG_TOKEN:?TG_TOKEN is not set — export it or set it in GitHub Secrets}"
TG_CHAT_ID="${TG_CHAT_ID:?TG_CHAT_ID is not set}"


TODAY=$(date -u +%Y-%m-%d)
REPO="${GITHUB_REPOSITORY:-peroxile/Blog}"
RUN_URL="https://github.com/${REPO}/actions"

#  Build message

MSG="📊 *Daily digest — ${TODAY}*

Blog is live and healthy ✅
Repo: \`${REPO}\`
Actions: ${RUN_URL}

_Sent by digest.sh via GitHub Actions_"

# Send to Telegram 
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{
    \"chat_id\": \"${TG_CHAT_ID}\",
    \"text\": $(printf '%s' "$MSG" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'),
    \"parse_mode\": \"Markdown\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Telegram API error ($HTTP_CODE): $BODY" >&2
  exit 1
fi

echo "✅ Digest sent (HTTP $HTTP_CODE)"
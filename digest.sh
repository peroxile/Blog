#!/usr/bin/env bash
set -euo pipefail

# Secrets injected via GitHub Actions env: block or exported locally
TG_TOKEN="${TG_TOKEN:?TG_TOKEN is not set}"
TG_CHAT_ID="${TG_CHAT_ID:?TG_CHAT_ID is not set}"

TODAY=$(date -u +%Y-%m-%d)
REPO="${GITHUB_REPOSITORY:-paul/blog}"

MSG="📊 *Daily digest - ${TODAY}*

Blog is live and healthy
Repo: ${REPO}"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{
    \"chat_id\": \"${TG_CHAT_ID}\",
    \"text\": \"${MSG}\",
    \"parse_mode\": \"Markdown\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" != "200" ]; then
  echo "Telegram API error ($HTTP_CODE)"
  echo "$RESPONSE"
  exit 1
fi

echo "Digest sent OK"
#!/usr/bin/env bash
set -euo pipefail

# Secrets injected via GitHub Actions env: block or exported locally
TG_TOKEN="${TG_TOKEN:?TG_TOKEN is not set}"
TG_CHAT_ID="${TG_CHAT_ID:?TG_CHAT_ID is not set}"

TODAY=$(date -u +%Y-%m-%d)
REPO="${GITHUB_REPOSITORY:-peroxile/Blog}"

# Pull stats from manifest.json
MANIFEST="public/data/manifest.json"

if [ -f "$MANIFEST" ]; then
    TOTAL=$(python3 -c "import json; data=json.load(open('$MANIFEST')); print(len(data))")
    LATEST_TITLE=$(python3 -c "import json; data=json.load(open('$MANIFEST')); print(data[0]['title']) if data else print('None')")
    LATEST_DATE=$(python3 -c "import json; data=json.load(open('$MANIFEST')); print(data[0]['date']) if data else print('N/A')")
else
    TOTAL="N/A"
    LATEST_TITLE="manifest not found"
    LATEST_DATE="N/A"
fi

# Pull git stats
LAST_COMMIT_MSG=$(git log -1 --pretty=format:"%s")
LAST_COMMIT_AUTHOR=$(git log -1 --pretty=format:"%an")
LAST_COMMIT_TIME=$(git log -1 --pretty=format:"%cd" --date=format:"%Y-%m-%d %H:%M UTC")
COMMITS_THIS_WEEK=$(git log --oneline --since="7 days ago" | wc -l | tr -d ' ')


# Articles published this week 
WEEK_AGO=$(date -u -d "7 days ago" +%Y-%m-%d 2>/dev/null || date -u -v-7d +%Y-%m-%d)
NEW_THIS_WEEK=$(python3 -c "
import json
from datetime import datetime
data = json.load(open('$MANIFEST')) if __import__('os').path.exists('$MANIFEST') else []
week_ago = '$WEEK_AGO'
new = [a for a in data if a.get('date','') >= week_ago]
print(len(new))
")


# Build message
MSG="📝 <b>Blog Digest — ${TODAY}</b>

📚 <b>Content</b>
  Total articles: <b>${TOTAL}</b>
  New this week:  <b>${NEW_THIS_WEEK}</b>
  Latest post:    <i>${LATEST_TITLE}</i>
  Published:      ${LATEST_DATE}

🔧 <b>Repo Activity</b>
  Commits this week: <b>${COMMITS_THIS_WEEK}</b>
  Last commit: <i>${LAST_COMMIT_MSG}</i>
  By: ${LAST_COMMIT_AUTHOR}
  At: ${LAST_COMMIT_TIME}

🔗 https://github.com/${REPO}"


# Send 
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\":\"${TG_CHAT_ID}\",\"text\":$(echo "$MSG" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'),\"parse_mode\":\"HTML\"}")

if [ "$HTTP_CODE" != "200" ]; then
  echo "Telegram error ($HTTP_CODE)"
  exit 1
fi

echo "Blog digest sent OK"
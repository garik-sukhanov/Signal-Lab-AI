#!/usr/bin/env bash

payload="$(cat)"

if [[ "$payload" == *"apps/backend/src/"* ]] && ([[ "$payload" == *".controller.ts"* ]] || [[ "$payload" == *".service.ts"* ]]); then
  cat <<'JSON'
{
  "additional_context": "Detected backend endpoint/service change. Confirm structured logs, metric updates, and proper Sentry behavior for unexpected failures."
}
JSON
  exit 0
fi

echo '{}'
exit 0

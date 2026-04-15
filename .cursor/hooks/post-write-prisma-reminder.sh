#!/usr/bin/env bash

payload="$(cat)"

if [[ "$payload" == *"prisma/schema.prisma"* ]]; then
  cat <<'JSON'
{
  "additional_context": "Detected Prisma schema change. Ensure migration is created and Prisma client is regenerated. Verify affected backend DTO/service typing."
}
JSON
  exit 0
fi

echo '{}'
exit 0

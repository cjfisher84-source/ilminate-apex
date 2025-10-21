#!/usr/bin/env bash
set -euo pipefail
BUCKET="${BUCKET:-ilminate-config}"                 # ✅ use existing staging bucket or set BUCKET=...
KEY="${KEY:-attack/enterprise-attack.json}"         # stored path/key
curl -L -o enterprise-attack.json \
  https://raw.githubusercontent.com/mitre-attack/attack-stix-data/main/enterprise-attack/enterprise-attack.json
aws s3 cp enterprise-attack.json "s3://${BUCKET}/${KEY}" --sse AES256
echo "✅ Uploaded to s3://${BUCKET}/${KEY}"


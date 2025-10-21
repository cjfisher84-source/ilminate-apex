# MITRE ATT&CK Backend Components

## 📦 Contents

```
ilminate-attack/
├── lambda/
│   └── attack_mapper/      # Lambda function for technique mapping
│       ├── app.py          # Main handler
│       ├── attack_meta.py  # MITRE metadata loader (S3)
│       ├── rules.py        # Pattern-based mapping rules
│       ├── requirements.txt
│       └── bootstrap.sh    # Deployment script
└── scripts/
    ├── fetch_attack_data.sh          # Downloads MITRE data to S3
    ├── backfill_attack_mapping.ts    # Event backfill (STAGING ONLY)
    └── DO_NOT_RUN_BACKFILL.txt       # Safety reminder
```

## 🚀 Quick Start (Staging Only)

### 1. Fetch MITRE ATT&CK Data

```bash
export BUCKET="ilminate-config"  # Staging S3 bucket
export KEY="attack/enterprise-attack.json"
./scripts/fetch_attack_data.sh
```

### 2. Deploy Lambda Mapper

```bash
export ROLE_ARN="arn:aws:iam::<ACCOUNT>:role/<LambdaExecWithS3Read>"
export ATTACK_S3_BUCKET="ilminate-config"
export ATTACK_S3_KEY="attack/enterprise-attack.json"
./lambda/attack_mapper/bootstrap.sh
```

Copy the output API URL and add to `.env.local`:

```bash
# In project root, create .env.local:
ATTACK_MAPPER_URL="https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/map"
NEXT_PUBLIC_ATTACK_LAYER_TITLE="Techniques Observed (30d)"
```

### 3. Test

```bash
# From project root
npm run dev

# In another terminal, test the mapper
curl -X POST "http://localhost:3000/api/attack/map" \
  -H "Content-Type: application/json" \
  -d '{"text": "Powershell -EncodedCommand ABC"}'
```

## 📝 Environment Variables

### Required for Backend Deployment

- `ROLE_ARN`: IAM role for Lambda (execution + S3 read)
- `ATTACK_S3_BUCKET`: S3 bucket containing MITRE data
- `ATTACK_S3_KEY`: S3 key for `enterprise-attack.json`
- `LAMBDA_NAME`: Lambda function name (default: `ilminate-attack-mapper`)

### Required for Frontend

Add to `.env.local` in project root:

```bash
ATTACK_MAPPER_URL="https://<API_ID>.execute-api.<region>.amazonaws.com/prod/map"
NEXT_PUBLIC_ATTACK_LAYER_TITLE="Techniques Observed (30d)"
```

## 🔒 Safety Notes

1. **Staging Only**: All scripts default to staging-safe values
2. **PAUSE & REVIEW**: Follow checkpoints in runbook
3. **No Production**: Never deploy without explicit sign-off
4. **Backups**: Take snapshots before running backfill script

## 📚 Full Documentation

See `ATTACK_INTEGRATION.md` in project root for complete guide.


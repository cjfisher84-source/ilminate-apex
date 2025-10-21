# MITRE ATT&CK® Integration Guide

## 🎯 Overview

This integration provides automated mapping of security events to MITRE ATT&CK techniques, including:
- **Backend**: AWS Lambda function for rule-based technique mapping
- **Frontend**: Interactive ATT&CK matrix visualization
- **API**: Next.js API routes to proxy Lambda requests
- **Reports**: `/reports/attack` page showing observed techniques

---

## 🏗️ Architecture

```
Event Data → Lambda Mapper → Next.js API → React UI
    ↓             ↓              ↓           ↓
Security    Pattern Match   JSON Proxy   Matrix
  Logs        + MITRE         Response    Visual
            Metadata (S3)
```

---

## 📦 Components

### Backend (`ilminate-attack/`)
- **`lambda/attack_mapper/`**: Python Lambda function
  - `app.py`: Main handler
  - `attack_meta.py`: MITRE ATT&CK metadata loader (from S3)
  - `rules.py`: Pattern-based mapping rules
  - `requirements.txt`: Python dependencies
  - `bootstrap.sh`: Deployment script
- **`scripts/`**: Utility scripts
  - `fetch_attack_data.sh`: Downloads MITRE data to S3
  - `backfill_attack_mapping.ts`: Backfills existing events (STAGING ONLY)

### Frontend (`src/`)
- **`app/api/attack/`**: Next.js API routes
  - `map/route.ts`: Proxies requests to Lambda mapper
  - `layer/route.ts`: Provides aggregated technique scores
- **`components/AttackMatrix.tsx`**: Interactive matrix UI component
- **`lib/attackMeta.ts`**: Technique metadata (MVP static, upgrade to S3)
- **`app/reports/attack/page.tsx`**: ATT&CK report page

---

## 🚀 Deployment (STAGING ONLY)

### Prerequisites
- AWS credentials configured
- IAM role with Lambda execution + S3 read permissions
- Staging S3 bucket (e.g., `ilminate-config`)
- Node.js 18+ and Python 3.11

---

### Step 1: Fetch MITRE ATT&CK Data to S3

```bash
cd ilminate-attack
export BUCKET="ilminate-config"  # Your staging S3 bucket
export KEY="attack/enterprise-attack.json"
./scripts/fetch_attack_data.sh
```

✅ **PAUSE & REVIEW**: Confirm data uploaded to S3 bucket

---

### Step 2: Deploy Lambda Mapper (Staging)

```bash
export ROLE_ARN="arn:aws:iam::<ACCOUNT>:role/<LambdaExecWithS3Read>"
export ATTACK_S3_BUCKET="ilminate-config"
export ATTACK_S3_KEY="attack/enterprise-attack.json"
export LAMBDA_NAME="ilminate-attack-mapper"

./lambda/attack_mapper/bootstrap.sh
```

**Output**: Staging API URL like:
```
✅ STAGING API: https://abc123def4.execute-api.us-east-1.amazonaws.com/prod/map
```

✅ **PAUSE & REVIEW**: Copy the API URL for Step 3

---

### Step 3: Configure Frontend Environment

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_ATTACK_LAYER_TITLE="Techniques Observed (30d)"
ATTACK_MAPPER_URL="https://<API_ID>.execute-api.<region>.amazonaws.com/prod/map"
```

Replace `<API_ID>` and `<region>` with values from Step 2.

✅ **PAUSE & REVIEW**: Verify URL is staging-only, not production

---

### Step 4: Test Locally

Start Next.js dev server:
```bash
npm run dev
```

Test the mapper API:
```bash
curl -X POST "http://localhost:3000/api/attack/map" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "test-123",
    "text": "Subject: Invoice overdue - view DocuSign. Powershell -EncodedCommand AA=="
  }'
```

Expected response includes `T1566` (Phishing) and `T1059.001` (PowerShell).

Open the UI:
```
http://localhost:3000/reports/attack
```

✅ **PAUSE & REVIEW**: 
- Matrix renders correctly
- Top techniques list populated
- Clicking technique navigates to `/events?technique=...`
- No errors in browser console

---

### Step 5: Commit to Feature Branch

```bash
git add .
git commit -m "feat: Add MITRE ATT&CK integration (staging-only)

🎯 New Features:
- Lambda mapper for technique detection
- Interactive ATT&CK matrix visualization
- /reports/attack page
- API routes for mapping and layer data

🔒 Safety:
- Staging-only deployment
- No production changes
- All components additive
- Clear rollback plan

📚 Documentation:
- ATTACK_INTEGRATION.md
- Deployment scripts with safety checks
- Backfill script (disabled by default)
"

git push origin feature/attack-matrix-mapper
```

---

### Step 6: Create Pull Request

Open PR: `feature/attack-matrix-mapper` → `staging`

**PR Checklist**:
- [ ] Lambda deployed to staging account only
- [ ] `.env.local` points to staging API
- [ ] `/reports/attack` renders in staging
- [ ] Mapper API responds correctly
- [ ] No production URLs referenced
- [ ] Documentation complete

✅ **PAUSE & REVIEW**: Get team approval before merge

---

### Step 7: Validate in Staging

After merge to staging branch:

1. Visit staging URL: `https://staging.apex.ilminate.com/reports/attack`
2. Verify matrix renders
3. Test technique drill-down
4. Check browser console for errors
5. Monitor CloudWatch logs for Lambda errors

---

### Step 8: Promote to Production (After Sign-Off Only)

**Prerequisites**:
- All staging tests pass
- Team sign-off received
- Production Lambda deployed separately
- Production `.env` configured

**Never promote without explicit approval!**

---

## 🧪 Testing

### Unit Test Lambda Locally

```bash
cd ilminate-attack/lambda/attack_mapper
python3 -c "
from rules import map_event
result = map_event('Powershell -EncodedCommand ABC')
print(result)
"
```

### Test Next.js API Route

```bash
# With dev server running
curl -X POST "http://localhost:3000/api/attack/map" \
  -H "Content-Type: application/json" \
  -d '{"text": "mimikatz lsass.dmp"}'
```

### Test Layer Endpoint

```bash
curl "http://localhost:3000/api/attack/layer?tenant=test&days=30"
```

---

## 📊 Mapping Rules

Current rules (in `lambda/attack_mapper/rules.py`):

| Pattern | Technique | Tactic | Confidence |
|---------|-----------|--------|------------|
| `spoofed`, `phish`, `fake login` | T1566 | Initial Access | 0.9 |
| `html smuggl`, `data:text/html` | T1027 | Defense Evasion | 0.7 |
| `.docm`, `.xlsm` | T1204.002 | Execution | 0.85 |
| `powershell -enc` | T1059.001 | Execution | 0.9 |
| `schtasks` | T1053 | Persistence | 0.8 |
| `mimikatz`, `lsass.dmp` | T1003 | Credential Access | 0.9 |
| ... | ... | ... | ... |

**To add new rules**: Edit `rules.py`, redeploy Lambda with `bootstrap.sh`

---

## 🔄 Backfill (Optional, Staging Only)

⚠️ **Do NOT run without approval and backup!**

```bash
# Take DynamoDB backup first!
TABLE=ILMINATE_EVENTS_STAGING \
MAPPER_PROXY="https://staging.apex.ilminate.com/api/attack/map" \
ts-node ilminate-attack/scripts/backfill_attack_mapping.ts
```

See `scripts/DO_NOT_RUN_BACKFILL.txt` for safety checklist.

---

## 🔧 Future Upgrades

1. **S3-backed metadata**: Replace static `attackMeta.ts` with S3 loader + cache
2. **Real aggregates**: Wire `/api/attack/layer` to DynamoDB/Athena
3. **Confidence filtering**: UI controls for minimum confidence threshold
4. **Analyst overrides**: Manual technique assignment/correction
5. **Nightly refresh**: Scheduled Lambda to update ATT&CK data
6. **Multi-tenancy**: Tenant-specific views and filtering
7. **Export to ATT&CK Navigator**: Generate `.json` layer files

---

## 🚨 Rollback Plan

### Backend
```bash
# Delete Lambda (staging)
aws lambda delete-function --function-name ilminate-attack-mapper

# Delete API Gateway (staging)
aws apigateway delete-rest-api --rest-api-id <API_ID>
```

### Frontend
```bash
# Revert merge or cherry-pick revert
git revert <commit-hash>
git push origin staging
```

### Data
If backfill was run, remove `techniques` attribute:
```bash
# Script to remove attribute from affected items
# (implement if needed after backfill approval)
```

---

## 📚 Resources

- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [ATT&CK STIX Data](https://github.com/mitre-attack/attack-stix-data)
- [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/)
- [Enterprise ATT&CK Matrix](https://attack.mitre.org/matrices/enterprise/)

---

## 🎯 Current Status

✅ **Completed**:
- Lambda mapper function with 12+ starter rules
- Next.js API routes (map, layer)
- Interactive ATT&CK matrix component
- Reports page at `/reports/attack`
- Deployment scripts with safety checks
- Comprehensive documentation

⏳ **Pending**:
- Staging deployment and validation
- Team review and sign-off
- Production promotion (after approval)

🔒 **Safety**:
- All changes on feature branch
- Staging-only by default
- Multiple PAUSE & REVIEW checkpoints
- Clear rollback procedures
- No production modifications

---

**Questions?** Contact the security platform team.


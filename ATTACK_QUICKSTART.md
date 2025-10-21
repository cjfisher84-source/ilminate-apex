# MITRE ATT&CK Integration - Quick Start

## 🚀 5-Minute Local Test

### Step 1: Create Environment File

Create `.env.local` in project root:

```bash
# For local testing, we'll use mock data (no Lambda needed yet)
NEXT_PUBLIC_ATTACK_LAYER_TITLE="Techniques Observed (30d)"
# ATTACK_MAPPER_URL will be set after Lambda deployment
```

### Step 2: Start Dev Server

```bash
npm run dev
```

### Step 3: Test the UI

Open browser: `http://localhost:3000/reports/attack`

You should see:
- ✅ ATT&CK matrix with heatmap
- ✅ Top 10 techniques list
- ✅ Technique scores and tactics
- ✅ Clickable techniques (will navigate to `/events?technique=...`)

### Step 4: Test API Routes (Optional)

**Layer endpoint** (provides mock aggregated data):
```bash
curl "http://localhost:3000/api/attack/layer?tenant=demo&days=30" | jq
```

**Mapper endpoint** (will fail without Lambda URL configured):
```bash
curl -X POST "http://localhost:3000/api/attack/map" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "test-123",
    "text": "Suspicious email with DocuSign lure. Powershell -EncodedCommand detected."
  }' | jq
```

Expected error: `ATTACK_MAPPER_URL not configured`  
This is normal! The Lambda hasn't been deployed yet.

---

## 🏗️ Full Staging Deployment

### Prerequisites
- AWS CLI configured
- IAM role: `arn:aws:iam::<ACCOUNT>:role/<LambdaExecWithS3Read>`
- S3 bucket: `ilminate-config` (staging)

### Step 1: Deploy Backend

```bash
cd ilminate-attack

# Fetch MITRE data
export BUCKET="ilminate-config"
./scripts/fetch_attack_data.sh

# Deploy Lambda
export ROLE_ARN="arn:aws:iam::<ACCOUNT>:role/<LambdaExecRole>"
export ATTACK_S3_BUCKET="ilminate-config"
export ATTACK_S3_KEY="attack/enterprise-attack.json"
./lambda/attack_mapper/bootstrap.sh
```

**Copy the output API URL!**

### Step 2: Update Environment

Add to `.env.local`:
```bash
ATTACK_MAPPER_URL="https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/map"
```

### Step 3: Restart & Test

```bash
# Stop dev server (Ctrl+C), then restart
npm run dev
```

Now test the mapper:
```bash
curl -X POST "http://localhost:3000/api/attack/map" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Phishing email with invoice scam. Powershell encoded command detected in attachment."
  }' | jq
```

Expected response:
```json
{
  "ok": true,
  "event_id": null,
  "techniques": [
    {
      "id": "T1566",
      "tactic": "Initial Access",
      "confidence": 0.9,
      "reason": "Rule: email/phish keywords",
      "name": "Phishing",
      "tactics_all": ["Initial Access"]
    },
    {
      "id": "T1059.001",
      "tactic": "Execution",
      "confidence": 0.9,
      "reason": "Rule: PS encoded command",
      "name": "PowerShell",
      "tactics_all": ["Execution"]
    }
  ]
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Phishing Detection
```bash
curl -X POST "http://localhost:3000/api/attack/map" \
  -H "Content-Type: application/json" \
  -d '{"text": "Fake login page with credential harvest"}' | jq '.techniques[].id'
```
Expected: `T1566`

### Scenario 2: PowerShell Execution
```bash
curl -X POST "http://localhost:3000/api/attack/map" \
  -H "Content-Type: application/json" \
  -d '{"text": "powershell.exe -EncodedCommand aGVsbG8="}' | jq '.techniques[].id'
```
Expected: `T1059.001`

### Scenario 3: Credential Dumping
```bash
curl -X POST "http://localhost:3000/api/attack/map" \
  -H "Content-Type: application/json" \
  -d '{"text": "mimikatz sekurlsa::logonpasswords detected"}' | jq '.techniques[].id'
```
Expected: `T1003`

### Scenario 4: Multiple Techniques
```bash
curl -X POST "http://localhost:3000/api/attack/map" \
  -H "Content-Type: application/json" \
  -d '{"text": "Phishing email with malicious .docm attachment containing obfuscated powershell"}' | jq
```
Expected: `T1566`, `T1204.002`, `T1059.001`

---

## ✅ Success Checklist

- [ ] Dev server runs without errors
- [ ] `/reports/attack` page loads
- [ ] ATT&CK matrix renders with heatmap colors
- [ ] Top techniques list shows data
- [ ] Clicking technique navigates correctly
- [ ] Layer API returns JSON with techniques
- [ ] (After Lambda) Mapper API returns detected techniques
- [ ] No console errors in browser
- [ ] No linter errors

---

## 🐛 Troubleshooting

### "ATTACK_MAPPER_URL not configured"
**Solution**: Lambda not deployed yet. For local testing, this is expected. The layer API will still work.

### Matrix doesn't render
**Solution**: Check browser console for errors. Ensure `/api/attack/layer` returns valid JSON.

### Techniques not detected
**Solution**: Check the text matches patterns in `ilminate-attack/lambda/attack_mapper/rules.py`

### Lambda deployment fails
**Solution**: 
1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify IAM role exists and has correct permissions
3. Check S3 bucket exists and is accessible

---

## 📚 Full Documentation

See `ATTACK_INTEGRATION.md` for complete deployment guide and architecture details.

---

## 🔒 Safety Reminders

- ✅ This is a **staging-only** feature branch
- ✅ No production systems are modified
- ✅ All changes are additive (no existing code changed)
- ✅ Backfill script is **disabled** by default
- ✅ Clear rollback procedures available

**Ready to deploy to staging?** Follow the full guide in `ATTACK_INTEGRATION.md`


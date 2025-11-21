# Add Environment Variables to AWS Amplify (Manual)

**Note:** AWS CLI commands had issues. Please add these manually via AWS Console.

---

## 📋 Steps to Add Environment Variables

### 1. Go to AWS Amplify Console
```
https://console.aws.amazon.com/amplify/home?region=us-east-1#/dd8npjfuz7rfy
```

### 2. Find Your App
- **App ID:** `dd8npjfuz7rfy`
- Click on the app

### 3. Navigate to Environment Variables
- Click **"App settings"** in left sidebar
- Click **"Environment variables"**
- Click **"Manage variables"**

### 4. Add These Variables

Click **"Add variable"** for each:

| Variable Name | Value |
|--------------|-------|
| `MCP_SERVER_URL` | `http://54.237.174.195:8888` |
| `MCP_API_KEY` | `bec96495b56159156c8651418ea265393033cd7dac2140393e4f89e2a6e7e7d8` |
| `MCP_ENABLED` | `true` |
| `REGION` | `us-east-1` |
| `DYNAMODB_EVENTS_TABLE` | `ilminate-apex-events` |
| `DYNAMODB_QUARANTINE_TABLE` | `ilminate-apex-quarantine` |
| `DYNAMODB_IMAGE_SCANS_TABLE` | `ilminate-image-scans` |

**Note:** Do NOT use `AWS_REGION` (reserved prefix). Use `REGION` instead.

### 5. Save and Deploy
- Click **"Save"**
- Amplify will automatically trigger a new build
- Monitor build progress in the "Build history" tab

---

## ✅ Verification

After build completes:

1. **Check Build Logs:**
   - Go to "Build history"
   - Click on latest build
   - Verify no errors related to MCP

2. **Test Security Assistant:**
   - Visit `apex.ilminate.com`
   - Use Security Assistant
   - Should see real threats from DynamoDB

3. **Test AI Triage:**
   - Visit `apex.ilminate.com/triage`
   - Submit test email
   - Should see enhanced analysis

---

## 📊 Current Status

- ✅ **Code:** Committed and pushed to GitHub
- ⏳ **Environment Variables:** Need to add manually via Console
- ⏳ **Build:** Will trigger automatically after adding env vars

---

**Next:** Add environment variables via AWS Console, then monitor build.


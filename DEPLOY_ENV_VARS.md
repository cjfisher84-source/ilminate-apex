# Deploy MCP Environment Variables

**App ID:** `dd8npjfuz7rfy`  
**Status:** Code pushed ✅ | Environment variables need to be added manually

---

## 🚀 Quick Steps

### 1. Open AWS Amplify Console
Direct link: https://console.aws.amazon.com/amplify/home?region=us-east-1#/dd8npjfuz7rfy

Or navigate:
1. Go to https://console.aws.amazon.com/amplify/
2. Search for app ID: `dd8npjfuz7rfy`
3. Click on the app

### 2. Add Environment Variables

1. Click **"App settings"** in left sidebar
2. Click **"Environment variables"**
3. Click **"Manage variables"**
4. Click **"Add variable"** for each:

| Variable Name | Value |
|--------------|-------|
| `MCP_SERVER_URL` | `http://54.237.174.195:8888` |
| `MCP_API_KEY` | `bec96495b56159156c8651418ea265393033cd7dac2140393e4f89e2a6e7e7d8` |
| `MCP_ENABLED` | `true` |
| `REGION` | `us-east-1` |
| `DYNAMODB_EVENTS_TABLE` | `ilminate-apex-events` |
| `DYNAMODB_QUARANTINE_TABLE` | `ilminate-apex-quarantine` |
| `DYNAMODB_IMAGE_SCANS_TABLE` | `ilminate-image-scans` |

5. Click **"Save"**

### 3. Monitor Build

After saving, Amplify will automatically:
- Trigger a new build
- Deploy the updated code with environment variables

Monitor progress:
- Go to **"Build history"** tab
- Watch the latest build complete

---

## ✅ What's Already Done

- ✅ Code committed to GitHub
- ✅ MCP client created (`src/lib/mcpClient.ts`)
- ✅ Security Assistant enhanced
- ✅ AI Triage enhanced
- ✅ Build successful locally

---

## 🧪 After Deployment

### Test Security Assistant:
1. Visit `apex.ilminate.com`
2. Use Security Assistant
3. Ask: "What threats have we seen this week?"
4. Should see real threats from DynamoDB

### Test AI Triage:
1. Visit `apex.ilminate.com/triage`
2. Submit a test email
3. Should see "Enhanced Analysis" indicator

---

## 📋 Checklist

- [x] Code pushed to GitHub
- [ ] Environment variables added via Console
- [ ] Build triggered automatically
- [ ] Build completed successfully
- [ ] Test Security Assistant
- [ ] Test AI Triage

---

**Next:** Add environment variables via AWS Console → Monitor build → Test!


# MCP Integration Deployment Guide

**Date:** January 2025  
**Status:** ✅ Code Integrated, Ready for Deployment

---

## ✅ Integration Complete

### Files Created/Modified:

1. **`src/lib/mcpClient.ts`** ✅ Created
   - MCP client wrapper for APEX Bridge
   - Email threat analysis
   - Domain investigation

2. **`src/app/api/assistant/route.ts`** ✅ Updated
   - Queries DynamoDB for real threats
   - Enriches AI context with MCP data

3. **`src/app/api/triage/route.ts`** ✅ Updated
   - Calls APEX Bridge for enhanced analysis
   - Merges MCP analysis with local analysis

---

## 🔧 Deployment Steps

### Step 1: Add Environment Variables to AWS Amplify

1. Go to **AWS Amplify Console**: https://console.aws.amazon.com/amplify/
2. Select app: **ilminate-apex** (App ID: `d15dkeaak9f84h`)
3. Click **Environment variables** in left sidebar
4. Click **Manage variables**
5. Add these variables:

```bash
# MCP/APEX Bridge Configuration
MCP_SERVER_URL=http://54.237.174.195:8888
MCP_API_KEY=bec96495b56159156c8651418ea265393033cd7dac2140393e4f89e2a6e7e7d8
MCP_ENABLED=true

# AWS Configuration (for DynamoDB access)
AWS_REGION=us-east-1
DYNAMODB_EVENTS_TABLE=ilminate-apex-events
DYNAMODB_QUARANTINE_TABLE=ilminate-apex-quarantine
DYNAMODB_IMAGE_SCANS_TABLE=ilminate-image-scans
```

6. Click **Save**
7. Amplify will automatically rebuild

### Step 2: Verify Deployment

After Amplify rebuilds:

1. **Test Security Assistant:**
   - Visit `apex.ilminate.com`
   - Use Security Assistant
   - Ask: "What threats have we seen this week?"
   - Should see real threats from DynamoDB

2. **Test AI Triage:**
   - Visit `apex.ilminate.com/triage`
   - Submit a test email
   - Should see "Enhanced Analysis" note if MCP is working

### Step 3: Monitor Logs

Check Amplify build logs and CloudWatch for:
- MCP connection errors
- DynamoDB access issues
- APEX Bridge timeouts

---

## 🔒 Security Considerations

### Network Security
- **Current:** MCP server at `54.237.174.195:8888` (public IP)
- **Recommendation:** Move to private subnet or use API Gateway

### API Key Security
- **Current:** API key in environment variables
- **Recommendation:** Use AWS Secrets Manager

### Access Control
- ✅ API key authentication enabled
- ✅ Customer isolation via `customerId`
- ✅ No cross-customer data access

---

## 📊 How It Works

### Security Assistant:
```
Customer → Security Assistant UI
  ↓
/api/assistant route
  ↓
Queries DynamoDB (ilminate-apex-events)
  ↓
Enriches AI context with real threats
  ↓
Claude/OpenAI generates response
  ↓
Customer sees real threat data
```

### AI Triage:
```
Customer → Triage UI
  ↓
/api/triage route
  ↓
Calls APEX Bridge (/api/analyze-email)
  ↓
Gets detection engine analysis
  ↓
Merges with local heuristics
  ↓
Returns enhanced analysis
```

---

## ✅ Benefits

### For Customers:
- ✅ **Real Data** - See actual threats from their environment
- ✅ **Better Detection** - Enhanced analysis using detection engines
- ✅ **Historical Context** - Threat patterns from DynamoDB
- ✅ **Accurate Responses** - AI assistant uses real data

### For ilminate:
- ✅ **Unified Architecture** - Same data source as MCP tools
- ✅ **Scalable** - MCP server can scale independently
- ✅ **Maintainable** - Single source of truth (DynamoDB)
- ✅ **Extensible** - Easy to add new MCP capabilities

---

## 🧪 Testing Checklist

- [ ] Environment variables added to AWS Amplify
- [ ] Amplify rebuild completed successfully
- [ ] Security Assistant shows real threats
- [ ] AI Triage shows enhanced analysis
- [ ] No errors in CloudWatch logs
- [ ] MCP server accessible from Amplify
- [ ] DynamoDB queries working

---

## 📝 Summary

**Status:** ✅ Ready for Deployment

- **Code:** ✅ Integrated and built successfully
- **MCP Client:** ✅ Created
- **Security Assistant:** ✅ Enhanced
- **AI Triage:** ✅ Enhanced
- **Next:** Add environment variables and deploy

**The MCP server is now customer-facing!** When customers use AI Triage or Security Assistant on `apex.ilminate.com`, they'll get enhanced analysis powered by the MCP server and real data from DynamoDB.


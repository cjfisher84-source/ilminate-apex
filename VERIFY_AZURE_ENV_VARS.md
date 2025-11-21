# ✅ Verify Azure Environment Variables for APEX MailVault

## Current Azure Environment Variables

The code checks for these environment variables (in order):
1. **Environment Variables** (`AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`)
2. **AWS Secrets Manager** (`apex-mailvault-azure-ad`) - fallback

---

## 🔍 Verify Your Current Variables

### Step 1: Check AWS Amplify Console

1. Go to: https://console.aws.amazon.com/amplify/home?region=us-east-1#/dd8npjfuz7rfy
2. Click **"Environment variables"** in the left menu
3. Look for these variables:
   - `AZURE_CLIENT_ID`
   - `AZURE_CLIENT_SECRET`
   - `AZURE_TENANT_ID`

### Step 2: Compare with MailVault Credentials

**APEX MailVault Credentials (Required):**
```
AZURE_CLIENT_ID=YOUR_CLIENT_ID
AZURE_CLIENT_SECRET=YOUR_CLIENT_SECRET
AZURE_TENANT_ID=YOUR_TENANT_ID
```

---

## ✅ If Variables Match

**You're all set!** The existing Azure environment variables will work for APEX MailVault.

No changes needed - the code will automatically use them.

---

## ⚠️ If Variables Don't Match

You have two options:

### Option A: Update Existing Variables (Recommended)

1. Go to AWS Amplify Console → Environment variables
2. Update each variable to match MailVault credentials above
3. Click "Save"
4. Amplify will automatically rebuild

### Option B: Use Different Variable Names

If you want to keep the existing variables for other purposes, you can:

1. **Keep existing variables** for other Azure integrations
2. **Add new MailVault-specific variables** (requires code change)
3. **Or use AWS Secrets Manager** as fallback

---

## 🔄 How the Code Works

The `microsoftGraph.ts` client checks in this order:

```typescript
// 1. Check environment variables first
if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
  return {
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    tenantId: process.env.AZURE_TENANT_ID
  }
}

// 2. Fallback to AWS Secrets Manager
// Fetches from: apex-mailvault-azure-ad
```

---

## 📝 Quick Checklist

- [ ] Check if `AZURE_CLIENT_ID` exists in Amplify
- [ ] Check if `AZURE_CLIENT_SECRET` exists in Amplify
- [ ] Check if `AZURE_TENANT_ID` exists in Amplify
- [ ] Compare values with MailVault credentials above
- [ ] Update if different, or verify they match
- [ ] Test at `/admin/messages` after rebuild

---

## 🧪 Test After Verification

Once variables are verified/updated:

1. Wait for Amplify rebuild (if you updated variables)
2. Go to `/admin/messages`
3. Select "Microsoft 365" as mailbox type
4. Enter a recipient email
5. Search for messages

If you see real messages (not placeholder), credentials are working! ✅

---

## 💡 Notes

- **Multiple Azure Apps:** If you have multiple Azure AD apps, you can use different variable names or Secrets Manager
- **Security:** Environment variables are encrypted at rest in Amplify
- **Rotation:** Update variables when secrets expire (typically 24 months for Azure AD secrets)


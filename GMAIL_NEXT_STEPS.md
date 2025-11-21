# 📋 Gmail API Setup - Next Steps

## ✅ Step 1: Service Account Created - DONE!

Now follow these steps:

---

## Step 2: Get Client ID

### 2.1 Find the Client ID

**Option A: From Service Account Details**
1. **Click on your service account:** `apex-mailvault-service`
2. **Look for "Client ID" or "Unique ID"** in the details
   - It's a long number (like: `123456789012345678901`)
   - Might be labeled as "OAuth 2.0 Client ID" or just "Client ID"
3. **COPY THIS CLIENT ID** - you'll need it in Step 4!

**Option B: From JSON Key File (Easier)**
1. **Download the JSON key file first** (see Step 3 below)
2. **Open the JSON file**
3. **Look for:** `"client_id"` field
4. **That's your Client ID!** Copy it.

**Note:** Domain-wide delegation doesn't need to be explicitly enabled in Google Cloud Console anymore. You just need the Client ID to authorize in Google Workspace Admin.

---

## Step 3: Download JSON Key File (Do This First - Easier!)

**Tip:** You can do this step first to get the Client ID from the JSON file!

### 3.1 Create Key

1. **Still on the service account details page:**
   - Click the **"Keys"** tab at the top
   - Click **"Add Key"** → **"Create new key"**
   - Choose **"JSON"** format
   - Click **"Create"**

### 3.2 Save the Key File

1. **The JSON file will download automatically**
   - Save it securely (you won't be able to download it again!)
   - Name it something like: `apex-mailvault-service-account.json`
   - **IMPORTANT:** Keep this file secure - it contains credentials!

---

## Step 4: Authorize in Google Workspace Admin Console

### 4.1 Go to Google Workspace Admin

1. **Navigate to:** https://admin.google.com
   - Sign in with your Google Workspace admin account

### 4.2 Navigate to Domain-Wide Delegation

1. **Go to:**
   - **Security** (in the left menu)
   - **API Controls**
   - **Domain-wide Delegation**

### 4.3 Add New Authorization

1. **Click "Add new"** (usually a + button or "Add" link)

2. **Fill in the form:**
   - **Client ID:** Paste the Client ID from Step 2.3 (the long number)
   - **OAuth scopes (comma-separated):** Paste this exactly:
     ```
     https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.modify
     ```

3. **Click "Authorize"**

4. **Verify:**
   - You should see the Client ID listed in the domain-wide delegation list
   - Status should show as authorized

---

## Step 5: Store Credentials

### Option A: AWS Secrets Manager (Recommended)

```bash
aws secretsmanager create-secret \
  --name apex-mailvault-gmail-service-account \
  --secret-string file://path/to/apex-mailvault-service-account.json \
  --region us-east-1 \
  --profile ilminate-prod
```

**Replace `path/to/apex-mailvault-service-account.json` with the actual path to your downloaded JSON file.**

### Option B: AWS Amplify Environment Variables

1. **Go to AWS Amplify Console:**
   - https://console.aws.amazon.com/amplify/home?region=us-east-1#/dd8npjfuz7rfy
   - Click "Environment variables"

2. **Add Variable:**
   - **Variable name:** `GMAIL_SERVICE_ACCOUNT_KEY`
   - **Variable value:** Open the JSON file, copy ALL the content, paste it here
   - Click "Save"

**Note:** The JSON should be on one line or properly formatted.

---

## Step 6: Install Dependencies

```bash
cd ilminate-apex
npm install googleapis
```

---

## Step 7: Implement Gmail API Client

The code needs to be implemented in `src/lib/gmailApi.ts`. 

**See:** `GMAIL_API_SETUP_GUIDE.md` for complete implementation code.

---

## Quick Checklist

- [ ] Service account created ✅
- [ ] Domain-wide delegation enabled
- [ ] Client ID copied
- [ ] JSON key file downloaded
- [ ] Authorized in Google Workspace Admin Console
- [ ] Credentials stored (Secrets Manager or Amplify)
- [ ] Dependencies installed (`npm install googleapis`)
- [ ] Gmail API client implemented

---

## Current Status

**You've completed:** Service account creation ✅

**Next:** Enable domain-wide delegation and get Client ID

---

## Need Help?

- **Full guide:** `GMAIL_API_SETUP_GUIDE.md`
- **Permissions explanation:** `GMAIL_SERVICE_ACCOUNT_PERMISSIONS.md`


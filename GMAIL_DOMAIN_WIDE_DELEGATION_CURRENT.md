# 🔐 Enable Domain-Wide Delegation - Current Google Cloud Console

## Updated Instructions (2025)

The Google Cloud Console UI may have changed. Here are the current ways to enable domain-wide delegation:

---

## Method 1: From Service Account Details Page

### Step 1: Open Service Account

1. Go to: https://console.cloud.google.com
2. Navigate to: **IAM & Admin** → **Service Accounts**
3. Click on your service account: `apex-mailvault-service`

### Step 2: Enable Domain-Wide Delegation

**Option A: In the Service Account Details**
1. Look for **"Advanced settings"** or **"Show advanced settings"** link
2. Or scroll down to find **"Domain-wide delegation"** section
3. Check the box: **"Enable Google Workspace Domain-wide Delegation"**
4. Click **"Save"**

**Option B: In the "Details" Tab**
1. Click the **"Details"** tab (if available)
2. Look for domain-wide delegation settings
3. Enable it there

**Option C: Via "Edit" Button**
1. Click **"Edit"** or **"Edit Service Account"** button
2. Look for domain-wide delegation option
3. Enable it and save

---

## Method 2: Find Client ID First

If you can't find the domain-wide delegation option, the Client ID might be visible elsewhere:

### Step 1: Check Service Account List

1. Go to: **IAM & Admin** → **Service Accounts**
2. Look at your service account row
3. The **Client ID** might be visible in the list (it's a long number)

### Step 2: Check Service Account Details

1. Click on your service account
2. Look for **"Unique ID"** or **"Client ID"** 
3. It might be labeled as:
   - "Client ID"
   - "Unique ID" 
   - "OAuth 2.0 Client ID"
   - Just a long number in the details

---

## Method 3: Enable via API (If UI Doesn't Work)

If the UI option isn't available, you can enable it via API:

```bash
# Get your project ID
PROJECT_ID="your-project-id"
SERVICE_ACCOUNT_EMAIL="apex-mailvault-service@${PROJECT_ID}.iam.gserviceaccount.com"

# Enable domain-wide delegation via gcloud CLI
gcloud iam service-accounts update ${SERVICE_ACCOUNT_EMAIL} \
  --enable-domain-wide-delegation
```

---

## What to Look For

The domain-wide delegation option might be:
- ✅ Under "Advanced settings"
- ✅ In a "Details" or "Settings" tab
- ✅ In the main service account details page
- ✅ Labeled as "Google Workspace Domain-wide Delegation"
- ✅ A checkbox or toggle switch

---

## Current UI Locations to Check

1. **Service Account Details Page:**
   - Top section (basic info)
   - "Permissions" tab
   - "Keys" tab
   - "Details" or "Advanced" section
   - Bottom of the page

2. **Edit Service Account:**
   - Click "Edit" button
   - Look for delegation settings

3. **Service Account List:**
   - Hover over service account
   - Click three dots menu
   - Look for delegation option

---

## Alternative: Get Client ID from JSON Key

If you can't find the Client ID in the UI:

1. **Download the JSON key file first** (Step 3)
2. **Open the JSON file**
3. **Look for:** `"client_id"` field
4. **That's your Client ID!**

The JSON file contains:
```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "123456789012345678901",  ← This is your Client ID!
  ...
}
```

---

## Quick Checklist

- [ ] Service account created ✅
- [ ] Looked for domain-wide delegation option in UI
- [ ] If found: Enabled it
- [ ] If not found: Will enable via API or use Client ID from JSON
- [ ] Got Client ID (from UI or JSON file)
- [ ] Downloaded JSON key file
- [ ] Ready to authorize in Google Workspace Admin

---

## Next Steps (Regardless of Method)

Once you have the **Client ID**:

1. **Go to Google Workspace Admin:** https://admin.google.com
2. **Navigate to:** Security → API Controls → Domain-wide Delegation
3. **Add new authorization** with:
   - Client ID (from UI or JSON file)
   - OAuth scopes: `https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.modify`

---

## Need Help?

**If you can't find the option:**
1. Try downloading the JSON key file first
2. The Client ID is in the JSON file (`client_id` field)
3. You can authorize in Google Workspace Admin with that Client ID
4. Domain-wide delegation might auto-enable when you authorize

**Or describe what you see:**
- What tabs/sections are visible on the service account page?
- Is there an "Edit" button?
- Can you see a Client ID anywhere?


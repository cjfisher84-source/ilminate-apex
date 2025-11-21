# 🧪 Test Microsoft Graph API Integration

## Quick Test Guide for APEX MailVault

---

## ✅ Pre-Test Checklist

Before testing, verify:

- [ ] Azure AD app registered ✅
- [ ] Permissions granted (Mail.Read, Mail.ReadWrite) ✅
- [ ] Admin consent granted ✅
- [ ] Credentials stored (Environment variables or Secrets Manager)
- [ ] Code deployed to Amplify

---

## Step 1: Verify Credentials Are Set

### Check AWS Amplify Environment Variables

1. **Go to:** https://console.aws.amazon.com/amplify/home?region=us-east-1#/dd8npjfuz7rfy
2. **Click:** "Environment variables"
3. **Verify these exist:**
   ```
   AZURE_CLIENT_ID=YOUR_CLIENT_ID
   AZURE_CLIENT_SECRET=YOUR_CLIENT_SECRET
   AZURE_TENANT_ID=YOUR_TENANT_ID
   ```

**If they don't exist or are different:**
- Update them to match the MailVault credentials above
- Click "Save"
- Amplify will rebuild automatically

---

## Step 2: Test via UI

### Test Search Functionality

1. **Go to:** https://apex.ilminate.com/admin/messages
   - Make sure you're logged in as admin (`cfisher@ilminate.com`)

2. **Fill in the search form:**
   - **Mailbox Type:** Select "Microsoft 365"
   - **Recipient Email:** Enter a real user email from your Microsoft 365 tenant
     - Example: `user@yourdomain.com`
   - **Subject:** Enter a search term (optional)
   - **Date From/To:** Set date range (optional)

3. **Click "Search Messages"**

4. **Expected Result:**
   - ✅ Should show real messages from that user's mailbox
   - ✅ Should NOT show placeholder/mock data
   - ✅ Messages should have real subjects, senders, dates

### Test Retrieve Functionality

1. **After searching:**
   - Select one or more messages
   - Click "Retrieve Selected"

2. **Expected Result:**
   - ✅ Messages retrieved successfully
   - ✅ Status shows "Retrieved"
   - ✅ S3 key displayed (if stored in S3)

---

## Step 3: Test via API Directly

### Test Search API

```bash
curl -X POST https://apex.ilminate.com/api/admin/messages/search \
  -H "Content-Type: application/json" \
  -H "x-user-email: cfisher@ilminate.com" \
  -H "x-customer-id: ilminate.com" \
  -d '{
    "mailboxType": "microsoft365",
    "recipientEmail": "user@yourdomain.com",
    "subject": "test",
    "limit": 10
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "messageId": "AAMkADU3...",
      "subject": "Real email subject",
      "senderEmail": "sender@example.com",
      "recipientEmail": "user@yourdomain.com",
      "receivedDateTime": "2025-01-15T10:30:00Z",
      "hasAttachments": false,
      "isRead": true,
      "mailboxType": "microsoft365",
      "preview": "Email preview text..."
    }
  ],
  "count": 1,
  "mailboxType": "microsoft365"
}
```

### Test Retrieve API

```bash
curl -X POST https://apex.ilminate.com/api/admin/messages/retrieve \
  -H "Content-Type: application/json" \
  -H "x-user-email: cfisher@ilminate.com" \
  -H "x-customer-id: ilminate.com" \
  -d '{
    "messageIds": ["AAMkADU3..."],
    "mailboxType": "microsoft365",
    "recipientEmail": "user@yourdomain.com",
    "storeInS3": true
  }'
```

---

## Step 4: Check for Errors

### Common Issues

**Error: "Failed to fetch Azure AD config"**
- **Cause:** Environment variables not set or incorrect
- **Fix:** Verify AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID in Amplify

**Error: "Insufficient privileges"**
- **Cause:** Admin consent not granted or wrong permissions
- **Fix:** Check Azure AD → API permissions → Verify admin consent granted

**Error: "User not found"**
- **Cause:** Recipient email doesn't exist in Microsoft 365
- **Fix:** Use a valid user email from your tenant

**Error: "Invalid client secret"**
- **Cause:** Client secret expired or incorrect
- **Fix:** Check secret value in Azure AD → Certificates & secrets

**Error: "Failed to search messages"**
- **Cause:** API call failed (check logs)
- **Fix:** Check browser console or Amplify logs for details

---

## Step 5: Check Logs

### Browser Console

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Look for:**
   - ✅ `🔍 Searching M365 mailboxes:` - Shows search is working
   - ❌ Any red errors - Indicates problems

### AWS Amplify Logs

1. **Go to:** Amplify Console → Your app → Monitoring → Logs
2. **Look for:**
   - API route logs (`/api/admin/messages/search`)
   - Microsoft Graph API errors
   - Authentication errors

---

## Success Indicators

✅ **Working correctly if:**
- Search returns real messages (not placeholder data)
- Messages have real subjects, senders, dates
- No errors in console/logs
- Retrieve functionality works
- Messages stored in S3 (if enabled)

❌ **Not working if:**
- Returns placeholder/mock data
- Shows error messages
- Empty results when you know messages exist
- Authentication errors

---

## Quick Test Script

Save this as `test-mailvault.sh`:

```bash
#!/bin/bash

# Test APEX MailVault Microsoft Graph API

BASE_URL="https://apex.ilminate.com"
ADMIN_EMAIL="cfisher@ilminate.com"
RECIPIENT_EMAIL="user@yourdomain.com"  # Change this!

echo "🧪 Testing APEX MailVault - Microsoft Graph API"
echo ""

# Test 1: Search
echo "1️⃣ Testing Search..."
curl -X POST "${BASE_URL}/api/admin/messages/search" \
  -H "Content-Type: application/json" \
  -H "x-user-email: ${ADMIN_EMAIL}" \
  -H "x-customer-id: ilminate.com" \
  -d "{
    \"mailboxType\": \"microsoft365\",
    \"recipientEmail\": \"${RECIPIENT_EMAIL}\",
    \"limit\": 5
  }" | jq '.'

echo ""
echo "2️⃣ Check results above - should see real messages!"
echo ""
echo "✅ If you see real messages, integration is working!"
echo "❌ If you see placeholder data, check credentials and permissions"
```

---

## Next Steps After Testing

**If test succeeds:**
- ✅ Microsoft Graph API integration is working!
- ✅ You can use APEX MailVault for Microsoft 365
- ✅ Gmail API can be added later

**If test fails:**
- Check error messages
- Verify credentials in Amplify
- Verify Azure AD permissions
- Check Amplify logs
- See troubleshooting section above

---

## Ready to Test?

1. ✅ Verify credentials in Amplify
2. ✅ Go to `/admin/messages`
3. ✅ Search for messages
4. ✅ Check results!

**Let me know what you see!** 🚀


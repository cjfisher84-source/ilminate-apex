# ✅ APEX MailVault - Test Checklist

## Status: Environment Variables Added ✅

---

## ⏳ Step 1: Wait for Amplify Rebuild

**Current Status:** Amplify is rebuilding with new Azure credentials

### Monitor Build:
1. **Go to:** https://console.aws.amazon.com/amplify/home?region=us-east-1#/dd8npjfuz7rfy
2. **Check:** Build history tab
3. **Wait for:** Build to complete (usually 5-10 minutes)
4. **Look for:** ✅ Build succeeded

---

## 🧪 Step 2: Test Microsoft Graph API

### Test via UI

1. **Go to:** https://apex.ilminate.com/admin/messages
   - Make sure you're logged in as admin (`cfisher@ilminate.com`)

2. **Fill in Search Form:**
   - ✅ **Mailbox Type:** Select "Microsoft 365"
   - ✅ **Recipient Email:** Enter a real user email from your Microsoft 365 tenant
     - Example: `user@yourdomain.com`
     - Must be a real user in your Microsoft 365 organization
   - ✅ **Subject:** (optional - leave blank to see all messages)
   - ✅ **Date From/To:** (optional)

3. **Click:** "Search Messages"

---

## ✅ Step 3: Verify Results

### Success Indicators:

✅ **Working Correctly:**
- Real email messages appear (not placeholder data)
- Messages have actual subjects, senders, dates
- Results match what's in the user's mailbox
- No error messages

❌ **Not Working:**
- Shows placeholder/mock data
- Error messages appear
- Empty results when messages should exist
- Authentication errors

---

## 🔍 Step 4: Check for Errors

### Browser Console (F12)

1. **Open DevTools:** Press F12
2. **Go to Console tab**
3. **Look for:**
   - ✅ `🔍 Searching M365 mailboxes:` - Good sign
   - ❌ Red errors - Indicates problems

### Common Errors:

**"Failed to fetch Azure AD config"**
- **Fix:** Verify environment variables are set correctly in Amplify

**"Insufficient privileges"**
- **Fix:** Check Azure AD → API permissions → Verify admin consent granted

**"User not found"**
- **Fix:** Use a valid user email from your Microsoft 365 tenant

**"Invalid client secret"**
- **Fix:** Verify secret value matches Azure AD

---

## 📊 Step 5: Test Retrieve Functionality

After successful search:

1. **Select one or more messages** (checkbox)
2. **Click:** "Retrieve Selected"
3. **Expected:**
   - ✅ Messages retrieved successfully
   - ✅ Status shows "Retrieved"
   - ✅ S3 key displayed (if stored in S3)

---

## 🎯 Quick Test Checklist

- [ ] Amplify rebuild completed
- [ ] Logged in as admin
- [ ] Navigated to `/admin/messages`
- [ ] Selected "Microsoft 365"
- [ ] Entered valid recipient email
- [ ] Clicked "Search Messages"
- [ ] Saw real messages (not placeholder)
- [ ] Tested retrieve functionality
- [ ] No errors in console

---

## 📝 Test Results

**After testing, note:**
- ✅ Did search work?
- ✅ Did you see real messages?
- ✅ Any errors?
- ✅ Did retrieve work?

---

## 🚀 Ready to Test!

1. **Wait for Amplify rebuild** (check build status)
2. **Go to:** `/admin/messages`
3. **Test search** with a real user email
4. **Share results!**

---

**Current Status:** ✅ Variables added → ⏳ Waiting for rebuild → 🧪 Ready to test!


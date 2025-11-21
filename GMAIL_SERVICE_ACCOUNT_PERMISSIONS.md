# 🔐 Gmail Service Account Permissions Guide

## Question: Should I Grant IAM Roles to the Service Account?

**Answer: NO - Skip this step!**

---

## Why Skip IAM Roles?

### For Gmail API with Domain-Wide Delegation:

1. **Domain-Wide Delegation Handles Authorization**
   - The service account uses domain-wide delegation to impersonate users
   - This happens at the Google Workspace Admin level, not Google Cloud IAM level
   - OAuth scopes in Google Workspace Admin provide the necessary permissions

2. **IAM Roles Are for Different Purposes**
   - IAM roles control access to **Google Cloud resources** (Compute Engine, Storage, etc.)
   - They don't control access to **Google Workspace APIs** (Gmail, Drive, etc.)
   - Gmail API access is controlled by OAuth scopes, not IAM roles

3. **Service Account Just Needs Domain-Wide Delegation**
   - Enable domain-wide delegation ✅
   - Authorize in Google Workspace Admin ✅
   - No IAM roles needed ✅

---

## What to Do at the Permissions Screen

When you see:
```
Grant this service account access to Apex MailVault so that it has 
permission to complete specific actions on the resources in your project.
```

**Action:** 
- Click **"Skip"** or **"Continue"** without selecting any roles
- Click **"Done"**

---

## What You DO Need

### ✅ Required Steps:

1. **Service Account Created** ✅
   - Name: `apex-mailvault-service`
   - JSON key downloaded

2. **Domain-Wide Delegation Enabled** ✅
   - Check the box: "Enable Google Workspace Domain-wide Delegation"
   - Note the Client ID

3. **Authorized in Google Workspace Admin** ✅
   - Go to admin.google.com
   - Security → API Controls → Domain-wide Delegation
   - Add Client ID with scopes:
     ```
     https://www.googleapis.com/auth/gmail.readonly
     https://www.googleapis.com/auth/gmail.modify
     ```

### ❌ NOT Required:

- IAM roles for the service account
- Project-level permissions
- Resource-specific access

---

## How It Works

```
Service Account (no IAM roles needed)
    ↓
Domain-Wide Delegation Enabled
    ↓
Authorized in Google Workspace Admin (with OAuth scopes)
    ↓
Can access user mailboxes via Gmail API ✅
```

---

---

## Step 2: Principals with Access (Also Skip)

When you see:
```
Principals with access (optional)
Grant access to users or groups that need to perform actions as this service account.
```

**Action:**
- Click **"Skip"** or **"Continue"** without adding any users/groups
- Click **"Done"**

**Why skip this too?**
- Your application code will use the service account directly
- No individual users need to impersonate the service account
- The service account credentials (JSON key) are used by your code, not by users
- Domain-wide delegation allows the service account to impersonate Google Workspace users (not the other way around)

---

## Summary

**At both optional screens:**

1. **"Grant Roles" screen:**
   - ✅ Click "Skip" or "Continue" without selecting roles
   - ✅ Click "Done"

2. **"Principals with Access" screen:**
   - ✅ Click "Skip" or "Continue" without adding users/groups
   - ✅ Click "Done"

**Then proceed to:**
- ✅ Enable domain-wide delegation
- ✅ Download JSON key file
- ✅ Authorize in Google Workspace Admin

**You're all set!** The service account will work without IAM roles or user access because:
- Domain-wide delegation handles authorization
- Your application code uses the JSON key directly
- No user impersonation needed


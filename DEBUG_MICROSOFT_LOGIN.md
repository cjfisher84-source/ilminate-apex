# 🔍 Debugging Microsoft Login - auth_failed Error

**Date**: November 17, 2025  
**Issue**: Microsoft login still failing with `auth_failed`  
**Status**: 🔍 Enhanced logging added for diagnosis

---

## 🔧 Enhanced Error Logging Added

I've added comprehensive error logging to help diagnose the issue:

### **Callback Route Logging**:
- Logs `error`, `error_description`, and `error_uri` from OAuth callback
- Logs all query parameters
- Includes error details in redirect URL

### **Login Page Logging**:
- Displays error description if available
- Logs error details to browser console

---

## 🔍 Next Steps to Diagnose

After the build completes (~7-13 minutes), try logging in again and check:

### **1. Browser Console** (F12 → Console):
Look for:
- `Login error:` with error details
- Any error messages from the OAuth flow

### **2. Server Logs** (Amplify CloudWatch):
Look for:
- `OAuth error received:` with full error details
- `Callback handler - Detected origin:` to verify origin detection
- Any error messages from Cognito

### **3. Check Error Details**:
The login page will now show the actual error message if available, for example:
- "Authentication failed: [actual error description]"

---

## 🎯 Common Issues & Solutions

### **Issue 1: Redirect URI Mismatch**

**Symptoms**: Error mentions "redirect_uri" or "invalid redirect"

**Check**:
1. Azure Portal → App registration → Authentication
2. Verify redirect URI is exactly:
   ```
   https://ilminate-customer-portal-jqo56pdt.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
   ```

**Fix**: Add the exact redirect URI in Azure AD

---

### **Issue 2: Client Secret Expired**

**Symptoms**: Error mentions "invalid_client" or "unauthorized_client"

**Check**:
1. Azure Portal → App registration → Certificates & secrets
2. Check if client secret is expired

**Fix**: Create new client secret and update Cognito

---

### **Issue 3: Provider Not Enabled**

**Symptoms**: Error mentions "identity provider" or "not available"

**Check**:
```bash
aws cognito-idp describe-user-pool-client \
  --user-pool-id us-east-1_l1TLx7JDv \
  --client-id 1uoiq3h1afgo6799gie48vmlcj \
  --region us-east-1
```

**Fix**: Ensure `AzureAD` is in `SupportedIdentityProviders`

---

### **Issue 4: User Not in Tenant**

**Symptoms**: Error mentions "user not found" or "access denied"

**Check**: 
- Azure AD provider uses `common` tenant (multi-tenant)
- User should be able to sign in with any Microsoft account

**Fix**: If using single tenant, update issuer URL to use tenant ID instead of `common`

---

## 📋 Current Configuration

### **Azure AD Provider**:
- **Name**: `AzureAD`
- **Client ID**: `6820e55f-f0b1-4fec-92e8-8aeb281dee1a`
- **Issuer**: `https://login.microsoftonline.com/common/v2.0`
- **Scopes**: `openid profile email`

### **App Client**:
- **Identity Providers**: `AzureAD`, `COGNITO`, `Google` ✅
- **OAuth Flows**: `code` ✅
- **OAuth Scopes**: `email`, `openid`, `profile` ✅

---

## 🔗 Useful Commands

### **Check Identity Providers**:
```bash
aws cognito-idp list-identity-providers \
  --user-pool-id us-east-1_l1TLx7JDv \
  --region us-east-1
```

### **Check App Client**:
```bash
aws cognito-idp describe-user-pool-client \
  --user-pool-id us-east-1_l1TLx7JDv \
  --client-id 1uoiq3h1afgo6799gie48vmlcj \
  --region us-east-1 \
  --query 'UserPoolClient.SupportedIdentityProviders'
```

### **Check Azure AD Provider Details**:
```bash
aws cognito-idp describe-identity-provider \
  --user-pool-id us-east-1_l1TLx7JDv \
  --provider-name AzureAD \
  --region us-east-1
```

---

## ✅ After Enhanced Logging Deploys

1. **Try logging in again** with Microsoft
2. **Check browser console** for error details
3. **Check server logs** (Amplify CloudWatch) for full error
4. **Share the error details** so we can fix the root cause

---

**Status**: 🔍 Enhanced logging deployed - waiting for error details







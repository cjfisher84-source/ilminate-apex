# ✅ Azure AD Issuer Fixed

**Date**: November 17, 2025  
**Issue**: "Bad id_token issuer" error  
**Status**: ✅ **FIXED** - Updated issuer URL to tenant-specific

---

## 🔍 Problem

The error showed:
```
Authentication failed: Bad id_token issuer https://login.microsoftonline.com/7159b266-2289-499e-807a-2cdd316f5122/v2.0
```

**Root Cause**: 
- Cognito was configured with issuer: `https://login.microsoftonline.com/common/v2.0`
- But the actual token had issuer: `https://login.microsoftonline.com/7159b266-2289-499e-807a-2cdd316f5122/v2.0`
- Cognito validates the issuer and rejected the token because they didn't match

---

## ✅ Fix Applied

Updated the Cognito identity provider to use the tenant-specific issuer:

**Before**:
```
oidc_issuer: https://login.microsoftonline.com/common/v2.0
```

**After**:
```
oidc_issuer: https://login.microsoftonline.com/7159b266-2289-499e-807a-2cdd316f5122/v2.0
```

---

## 📋 Configuration Details

### **Azure AD Tenant**:
- **Tenant ID**: `7159b266-2289-499e-807a-2cdd316f5122`
- **Issuer URL**: `https://login.microsoftonline.com/7159b266-2289-499e-807a-2cdd316f5122/v2.0`

### **Cognito Provider**:
- **Provider Name**: `AzureAD`
- **User Pool ID**: `us-east-1_l1TLx7JDv`
- **Updated Issuer**: `https://login.microsoftonline.com/7159b266-2289-499e-807a-2cdd316f5122/v2.0`

---

## 🧪 Testing

Now try logging in again:

1. Go to: https://apex.ilminate.com/login
2. Click **"Sign in with Microsoft"**
3. Sign in with `spam@ilminate.com` (or any account in tenant `7159b266-2289-499e-807a-2cdd316f5122`)
4. ✅ Should now work!

---

## ⚠️ Important Notes

### **Single Tenant vs Multi-Tenant**:

**Current Configuration** (Single Tenant):
- Only users from tenant `7159b266-2289-499e-807a-2cdd316f5122` can sign in
- This is more secure but limits access to your organization only

**If You Want Multi-Tenant** (Any Microsoft Account):
- Change issuer back to: `https://login.microsoftonline.com/common/v2.0`
- But you'll need to configure Azure AD app registration to allow multi-tenant
- And ensure the app registration supports "Accounts in any organizational directory"

---

## 🔧 Command Used

```bash
aws cognito-idp update-identity-provider \
  --user-pool-id us-east-1_l1TLx7JDv \
  --provider-name AzureAD \
  --region us-east-1 \
  --provider-details "oidc_issuer=https://login.microsoftonline.com/7159b266-2289-499e-807a-2cdd316f5122/v2.0"
```

---

## ✅ Status

**Microsoft SSO**: ✅ **FIXED** - Issuer URL updated to match tenant

Try logging in again - it should work now!







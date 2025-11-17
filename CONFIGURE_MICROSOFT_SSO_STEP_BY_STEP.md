# 🔐 Configure Microsoft SSO for APEX - Step-by-Step Guide

**Date**: November 17, 2025  
**Purpose**: Enable Microsoft/Azure AD login for apex.ilminate.com  
**Estimated Time**: 30-45 minutes

---

## 📋 Prerequisites

- Access to Azure Portal (Azure AD admin)
- Access to AWS Console (Cognito permissions)
- Admin access to `ilminate.com` domain (for email verification)

---

## Step 1: Configure Azure AD App Registration

### 1.1 Navigate to Azure Portal

1. Go to: https://portal.azure.com
2. Sign in with your Azure AD admin account
3. Navigate to: **Azure Active Directory** → **App registrations**

### 1.2 Create New App Registration

1. Click **"+ New registration"**
2. Fill in the form:
   - **Name**: `ilminate-apex-sso`
   - **Supported account types**: 
     - Select: **"Accounts in this organizational directory only (Single tenant)"**
     - OR **"Accounts in any organizational directory (Any Azure AD directory - Multitenant)"** if you want external users
   - **Redirect URI**: 
     - Platform: **Web**
     - URL: `https://ilminate-customer-portal-jqo56pdt.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
3. Click **"Register"**

### 1.3 Note Important Values

After registration, you'll see the **Overview** page. Note these values:

- **Application (client) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` ⚠️ **SAVE THIS**
- **Directory (tenant) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` ⚠️ **SAVE THIS**

### 1.4 Create Client Secret

1. In the app registration, go to: **Certificates & secrets**
2. Click **"+ New client secret"**
3. Fill in:
   - **Description**: `Cognito Integration`
   - **Expires**: Choose expiration (6 months, 12 months, or Never)
4. Click **"Add"**
5. **⚠️ IMPORTANT**: Copy the **Value** immediately (you won't be able to see it again!)
   - Value: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` ⚠️ **SAVE THIS**

### 1.5 Configure API Permissions (Optional but Recommended)

1. Go to: **API permissions**
2. Click **"+ Add a permission"**
3. Select: **Microsoft Graph** → **Delegated permissions**
4. Add these permissions:
   - `openid` (usually already added)
   - `email`
   - `profile`
   - `User.Read`
5. Click **"Add permissions"**
6. Click **"Grant admin consent"** (if you're an admin)

---

## Step 2: Add OpenID Connect Provider to Cognito

### 2.1 Navigate to AWS Cognito

1. Go to: https://console.aws.amazon.com/cognito/home?region=us-east-1
2. Click **"User pools"**
3. Find and click: **`ilminate-customer-portal`** (ID: `us-east-1_l1TLx7JDv`)

### 2.2 Add Identity Provider

1. In the left sidebar, go to: **Sign-in experience**
2. Scroll down to: **Federated identity provider sign-in**
3. Click **"Add identity provider"**
4. Select: **OpenID Connect (OIDC)**

### 2.3 Configure OIDC Provider

Fill in the form with values from Azure:

**Provider name**: `AzureADv2`

**Client ID**: 
```
[Paste the Application (client) ID from Azure]
```

**Client secret**: 
```
[Paste the Client secret Value from Azure]
```

**Authorized scopes**: 
```
openid email profile
```

**Issuer URL**: 
```
https://login.microsoftonline.com/[TENANT_ID]/v2.0
```
⚠️ Replace `[TENANT_ID]` with your Directory (tenant) ID from Azure

**Example**:
```
https://login.microsoftonline.com/12345678-1234-1234-1234-123456789012/v2.0
```

### 2.4 Configure Attribute Mapping

Map Azure AD attributes to Cognito attributes:

| Cognito attribute | Azure AD attribute |
|------------------|-------------------|
| `email` | `email` |
| `name` | `name` |
| `given_name` | `given_name` |
| `family_name` | `family_name` |
| `username` | `preferred_username` |

**How to set this**:
1. Scroll down to **Attribute mapping**
2. Click **"Add attribute mapping"** for each:
   - **Cognito attribute**: `email` → **Azure AD attribute**: `email`
   - **Cognito attribute**: `name` → **Azure AD attribute**: `name`
   - **Cognito attribute**: `given_name` → **Azure AD attribute**: `given_name`
   - **Cognito attribute**: `family_name` → **Azure AD attribute**: `family_name`
   - **Cognito attribute**: `username` → **Azure AD attribute**: `preferred_username`

### 2.5 Save Provider

1. Review all settings
2. Click **"Create provider"**
3. ✅ You should see `AzureADv2` in the list of identity providers

---

## Step 3: Enable AzureADv2 in App Client

### 3.1 Navigate to App Client Settings

1. In the Cognito User Pool, go to: **App integration**
2. Click **"App clients"**
3. Find and click: **`ilminate-customer-portal-client`** (Client ID: `1uoiq3h1afgo6799gie48vmlcj`)

### 3.2 Edit App Client

1. Click **"Edit"** (top right)
2. Scroll down to: **Identity providers**

### 3.3 Enable Identity Providers

Check the boxes for:
- ✅ **Cognito user pool** (should already be checked)
- ✅ **Google** (should already be checked)
- ✅ **AzureADv2** ← **CHECK THIS ONE** (newly added)

### 3.4 Configure OAuth Settings

Make sure these are configured:

**Allowed OAuth flows**:
- ✅ **Authorization code grant**
- ✅ **Implicit grant** (optional, but recommended)

**Allowed OAuth scopes**:
- ✅ **openid**
- ✅ **email**
- ✅ **profile**

**Callback URLs**:
- `https://apex.ilminate.com/api/auth/callback`
- `https://apex.ilminate.com/`
- `http://localhost:3000/api/auth/callback` (for local dev)

**Sign-out URLs**:
- `https://apex.ilminate.com/login`
- `http://localhost:3000/login` (for local dev)

### 3.5 Save Changes

1. Review all settings
2. Click **"Save changes"**
3. ✅ App client should now show `AzureADv2` as enabled

---

## Step 4: Verify Configuration

### 4.1 Test Microsoft Login

1. Go to: https://apex.ilminate.com/login
2. Click **"Sign in with Microsoft"**
3. You should be redirected to Microsoft login page
4. Sign in with a Microsoft account (e.g., `spam@ilminate.com`)
5. After authentication, you should be redirected back to apex.ilminate.com
6. ✅ Should land on the dashboard

### 4.2 Verify User Attributes

After logging in, check that:
- User email is correct
- Customer ID is mapped correctly (`ilminate.com` for `@ilminate.com` emails)
- User can access the quarantine page
- Real data is shown (not mock data)

---

## Step 5: Troubleshooting

### Issue: "Login option is not available"

**Cause**: Identity provider not enabled in app client

**Fix**:
1. Go to App clients → Edit
2. Make sure `AzureADv2` is checked under Identity providers
3. Save changes

### Issue: "Invalid redirect URI"

**Cause**: Redirect URI mismatch between Azure and Cognito

**Fix**:
1. Azure Portal → App registration → Authentication
2. Verify redirect URI matches exactly:
   ```
   https://ilminate-customer-portal-jqo56pdt.auth.us-east-1.amazoncognito.com/oauth2/idpresponse
   ```
3. AWS Cognito → App client → Callback URLs
4. Verify callback URL:
   ```
   https://apex.ilminate.com/api/auth/callback
   ```

### Issue: "Invalid client secret"

**Cause**: Client secret expired or incorrect

**Fix**:
1. Azure Portal → App registration → Certificates & secrets
2. Create a new client secret
3. Update Cognito identity provider with new secret
4. Save changes

### Issue: "User not found" or "Access denied"

**Cause**: User doesn't exist in Azure AD or doesn't have permission

**Fix**:
1. Verify user exists in Azure AD
2. Check user has permission to sign in
3. If using single-tenant, verify user is in the same tenant

---

## 📝 Quick Reference

### Azure AD Values Needed:
- **Application (client) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Directory (tenant) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Client secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Cognito Configuration:
- **User Pool ID**: `us-east-1_l1TLx7JDv`
- **User Pool Name**: `ilminate-customer-portal`
- **App Client ID**: `1uoiq3h1afgo6799gie48vmlcj`
- **Domain**: `ilminate-customer-portal-jqo56pdt.auth.us-east-1.amazoncognito.com`

### URLs:
- **Azure Redirect URI**: `https://ilminate-customer-portal-jqo56pdt.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`
- **Cognito Callback URL**: `https://apex.ilminate.com/api/auth/callback`
- **Issuer URL**: `https://login.microsoftonline.com/[TENANT_ID]/v2.0`

---

## ✅ Success Checklist

- [ ] Azure AD app registration created
- [ ] Client secret created and saved
- [ ] OIDC provider added to Cognito (`AzureADv2`)
- [ ] Attribute mapping configured
- [ ] `AzureADv2` enabled in app client
- [ ] OAuth flows and scopes configured
- [ ] Callback URLs configured
- [ ] Test login successful
- [ ] User can access dashboard
- [ ] Real data shows in quarantine

---

## 🎯 Next Steps After Configuration

1. **Test with `spam@ilminate.com`**:
   - Log in with Microsoft
   - Verify customer ID is `ilminate.com`
   - Check quarantine shows real data

2. **Add More Users**:
   - Users with `@ilminate.com` emails will automatically map to `ilminate.com` customer ID
   - Other domains will map to their domain as customer ID

3. **Monitor Logs**:
   - Check CloudWatch logs for authentication issues
   - Monitor failed login attempts

---

**Status**: Ready to configure! Follow steps 1-4 above.


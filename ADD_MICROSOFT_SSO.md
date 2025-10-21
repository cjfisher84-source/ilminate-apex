# How to Add Microsoft/Azure AD Login to APEX

## Current Status
- ✅ Google OAuth: Working
- ⏳ Microsoft/Azure AD: Not yet configured in Cognito
- ✅ Token Access: Working

## Error Encountered
When attempting Microsoft login, Cognito returns:
```
Login option is not available. Please try another one
```

This means the Azure AD Identity Provider is not configured in the Cognito User Pool.

---

## Steps to Add Microsoft Login

### Step 1: Configure Azure AD App Registration

1. Go to **Azure Portal** → **Azure Active Directory** → **App registrations**
2. Click **New registration**
3. Configure:
   - **Name**: `ilminate-apex-sso`
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: 
     - Type: Web
     - URL: `https://ilminate-customer-portal-jqo56pdt.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`

4. Click **Register**

5. Note the following values:
   - **Application (client) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Directory (tenant) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

6. Go to **Certificates & secrets**
7. Click **New client secret**
8. Note the **Value** (you'll need this for Cognito)

---

### Step 2: Add Identity Provider to Cognito

1. Open **AWS Console** → **Cognito** → **User Pools**
2. Select: `ilminate-customer-portal-jqo56pdt`
3. Go to **Sign-in experience** → **Federated identity provider sign-in**
4. Click **Add identity provider**
5. Select **OpenID Connect (OIDC)**

6. Configure OIDC Provider:
   ```
   Provider name: AzureADv2
   
   Client ID: [Application (client) ID from Azure]
   
   Client secret: [Client secret value from Azure]
   
   Authorized scopes: openid email profile
   
   Issuer URL: https://login.microsoftonline.com/[TENANT_ID]/v2.0
   
   Attribute mapping:
   - email → email
   - preferred_username → unique_name
   - given_name → given_name  
   - family_name → family_name
   ```

7. Click **Create provider**

---

### Step 3: Update App Client

1. In Cognito User Pool, go to **App integration** → **App clients**
2. Select your app client: `1uoiq3h1afgo6799gie48vmlcj`
3. Click **Edit**
4. Under **Identity providers**, enable:
   - ✅ Cognito user pool
   - ✅ Google
   - ✅ AzureADv2 (newly added)
5. Click **Save changes**

---

### Step 4: Update Login Page Code

Uncomment the Microsoft button in `src/app/login/page.tsx`:

```typescript
{/* SSO Login Buttons */}
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
  {/* Google Login */}
  <Button onClick={() => handleSSOLogin('Google')}>
    Sign in with Google
  </Button>

  {/* Microsoft Login - NOW ENABLED */}
  <Button onClick={() => handleSSOLogin('AzureADv2')}>
    Sign in with Microsoft
  </Button>
</Box>
```

---

### Step 5: Test

1. Visit: `https://apex.ilminate.com/login`
2. Click **Sign in with Microsoft**
3. Should redirect to Azure AD login
4. Sign in with Microsoft account
5. Should callback to apex.ilminate.com
6. ✅ Should land on dashboard

---

## Current Login Page Status

### Working Login Methods:
1. ✅ **Google OAuth**
   - Click "Sign in with Google"
   - Works perfectly
   - Configured and tested

2. ✅ **Direct Token Access**
   - Enter token: `7885c5de63b9b75428cacee0731b80509590783da34b02dd3373276b75ef8e25`
   - Click "Access with Token"
   - Grants immediate access

### Pending:
3. ⏳ **Microsoft OAuth**
   - Requires Azure AD configuration in Cognito
   - Code is ready (just commented out)
   - Can be enabled once Cognito is configured

---

## Quick Reference

### Cognito Details
- **User Pool**: `ilminate-customer-portal-jqo56pdt`
- **Region**: `us-east-1`
- **App Client ID**: `1uoiq3h1afgo6799gie48vmlcj`
- **Callback URL**: `https://apex.ilminate.com/`

### Provider Names
- **Google**: `Google` (configured ✅)
- **Azure AD**: `AzureADv2` (not configured ⏳)

### Azure AD Endpoints (when configuring)
- **Issuer**: `https://login.microsoftonline.com/[TENANT_ID]/v2.0`
- **Authorize**: `https://login.microsoftonline.com/[TENANT_ID]/oauth2/v2.0/authorize`
- **Token**: `https://login.microsoftonline.com/[TENANT_ID]/oauth2/v2.0/token`
- **JWKS**: `https://login.microsoftonline.com/[TENANT_ID]/discovery/v2.0/keys`

---

## Summary

**Current State**: Google OAuth works, Microsoft needs Cognito configuration

**To Enable Microsoft**:
1. Set up Azure AD app registration
2. Add OIDC provider to Cognito
3. Enable in app client
4. Uncomment Microsoft button in code
5. Deploy and test

**Estimated Time**: 30-45 minutes for Azure/Cognito configuration

---

**The login page is production-ready with Google OAuth!** Microsoft can be added later when you configure Azure AD in Cognito. 🚀


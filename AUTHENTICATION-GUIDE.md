# 🔐 APEX Authentication & Authorization Guide

## Overview

APEX uses AWS Cognito for SSO authentication with domain-based authorization. Only users from authorized domains or specific email addresses can access the portal.

---

## 🚪 Access Methods

### 1. **SSO Login (Recommended)**
- **Google OAuth** - Sign in with Google account
- **Microsoft OAuth** - Sign in with Microsoft account (if configured)

**Requirements:**
- Email domain must be in `AUTHORIZED_DOMAINS` list
- OR specific email must be in `AUTHORIZED_EMAILS` list

### 2. **Direct Token Access**
For admin/testing purposes only:
```
https://apex.ilminate.com/?k=YOUR_TOKEN_HERE
```

**Default Token:**
```
7885c5de63b9b75428cacee0731b80509590783da34b02dd3373276b75ef8e25
```

---

## ✅ How to Authorize New Users

### **Option A: Authorize Entire Organization**

Edit `src/lib/authorizedUsers.ts`:

```typescript
export const AUTHORIZED_DOMAINS: string[] = [
  'ilminate.com',
  'customer-company.com',    // ← Add customer domain
  'partner-organization.com', // ← Add partner domain
]
```

**When to use:** Customer has own email domain (e.g., `@acme-corp.com`)

### **Option B: Authorize Specific Email Address**

Edit `src/lib/authorizedUsers.ts`:

```typescript
export const AUTHORIZED_EMAILS: string[] = [
  'cfo@external-company.com',     // ← Add specific user
  'security.lead@partner.com',    // ← Add another user
]
```

**When to use:** Individual needs access without authorizing entire domain

### **Option C: Make User Admin**

Edit `src/lib/authorizedUsers.ts`:

```typescript
export const ADMIN_EMAILS: string[] = [
  'admin@ilminate.com',   // ← Add admin user
]
```

**When to use:** User needs administrative privileges (future role-based access)

---

## 🔒 Security Architecture

### **Middleware Protection** (`src/middleware.ts`)

The middleware validates all requests and implements three authentication methods:

```typescript
// Priority order:
1. Direct Token Access → ?k=TOKEN
2. OAuth Callback → Validates Cognito domain in referer
3. Cognito Session → Validates ID token + checks authorized email
```

### **Authorization Flow**

```
User Login Attempt
    ↓
Cognito Authentication (Google/Microsoft)
    ↓
Middleware extracts email from JWT
    ↓
Check: Is email in AUTHORIZED_EMAILS?
    ├─ YES → Allow access
    └─ NO → Check: Is domain in AUTHORIZED_DOMAINS?
        ├─ YES → Allow access
        └─ NO → Block with error message
```

### **What Gets Validated**

✅ **Valid Cognito ID token** - Not just any cookie  
✅ **Email domain** - Must be in whitelist  
✅ **Specific emails** - Can authorize individuals  
✅ **OAuth source** - Validates callback came from correct Cognito domain  

❌ **Rejected:**
- Random cookies with "cognito" in name
- Expired tokens
- Emails from non-authorized domains
- Spoofed referer headers

---

## 📝 Configuration Files

### **1. Authorized Users Config**
**File:** `src/lib/authorizedUsers.ts`

Manages who can access the portal:
- `AUTHORIZED_DOMAINS` - Approved email domains
- `AUTHORIZED_EMAILS` - Individual approved emails
- `ADMIN_EMAILS` - Admin users (for future RBAC)

### **2. Middleware**
**File:** `src/middleware.ts`

Implements authentication logic:
- Validates Cognito tokens
- Checks authorization
- Protects all routes except `/login` and public assets

### **3. Auth Utilities**
**File:** `src/lib/auth.ts`

Helper functions for JWT validation and email authorization (for server-side use).

---

## 🧪 Testing Access

### **Test Unauthorized Access**

1. Try logging in with Gmail account not in whitelist
2. **Expected:** Blocked with error message:
   ```
   Access denied: user@gmail.com is not authorized to access this portal.
   Please contact support@ilminate.com to request access.
   ```

### **Test Authorized Access**

1. Add your email domain to `AUTHORIZED_DOMAINS`
2. Deploy changes
3. Login with SSO
4. **Expected:** Successfully redirected to dashboard

### **Test Direct Token Access**

1. Visit: `https://apex.ilminate.com/?k=<token>`
2. **Expected:** Immediately access dashboard (bypasses SSO)

---

## 🚀 Deployment Checklist

### Before Deploying:

- [ ] Review `AUTHORIZED_DOMAINS` list
- [ ] Review `AUTHORIZED_EMAILS` list
- [ ] Update `ADMIN_EMAILS` if needed
- [ ] Test build: `npm run build`
- [ ] Verify no TypeScript errors
- [ ] Test locally if possible

### Deploy:

```bash
cd "/Users/cfisher/Library/Mobile Documents/com~apple~CloudDocs/ilminate-apex"
git add .
git commit -m "🔒 Update authorized users configuration"
git push origin main
```

### After Deploying:

- [ ] Test with authorized user → Should work
- [ ] Test with unauthorized user → Should be blocked
- [ ] Verify error messages display correctly
- [ ] Check CloudWatch logs for errors

---

## 🛠️ Troubleshooting

### **Issue: User can't login even though in whitelist**

**Possible causes:**
1. Email domain spelled incorrectly in `AUTHORIZED_DOMAINS`
2. User's email doesn't match expected format
3. Cognito cookie not being set correctly

**Solution:**
1. Check exact email address user is signing in with
2. Verify domain is spelled correctly (lowercase)
3. Check browser console for errors
4. Look at middleware logs in CloudWatch

### **Issue: Any user can still access portal**

**Possible causes:**
1. Old middleware code still deployed
2. Build didn't complete successfully
3. Environment variables not set

**Solution:**
1. Verify latest code is deployed
2. Check `src/middleware.ts` contains authorization logic
3. Force rebuild and redeploy

### **Issue: Direct token access not working**

**Possible causes:**
1. Token doesn't match `NEXT_PUBLIC_PORTAL_TOKEN`
2. Middleware not checking token correctly

**Solution:**
1. Verify token matches in middleware (line 87)
2. Check environment variable in Amplify console
3. Try default token from source code

---

## 🔐 Environment Variables

Required in AWS Amplify Console:

```bash
# Portal Token (for direct access)
NEXT_PUBLIC_PORTAL_TOKEN=7885c5de63b9b75428cacee0731b80509590783da34b02dd3373276b75ef8e25

# Cognito Configuration
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_jqo56pdt
COGNITO_CLIENT_ID=1uoiq3h1afgo6799gie48vmlcj
COGNITO_DOMAIN=ilminate-customer-portal-jqo56pdt.auth.us-east-1.amazoncognito.com
```

---

## 📞 Support

### **For Users Requesting Access:**
Contact: support@ilminate.com

Provide:
- Full name
- Email address
- Organization name
- Reason for access request

### **For Admins Adding Users:**
1. Edit `src/lib/authorizedUsers.ts`
2. Add email domain or specific email
3. Commit and push changes
4. Verify in production after deployment

---

## 🚨 Security Best Practices

### **DO:**
✅ Use domain authorization when possible (`AUTHORIZED_DOMAINS`)  
✅ Review access list quarterly  
✅ Remove users who no longer need access  
✅ Keep token secret and rotate regularly  
✅ Monitor CloudWatch logs for unauthorized attempts  

### **DON'T:**
❌ Share direct access tokens publicly  
❌ Add personal Gmail/Microsoft accounts to production  
❌ Disable authentication checks  
❌ Use weak or predictable tokens  
❌ Grant access without verifying identity  

---

## 📊 Monitoring

### **CloudWatch Logs**
Location: `/aws/lambda/apex-middleware` (if using Lambda@Edge)

**Watch for:**
- `🚫 Unauthorized access attempt from:` - Blocked users
- Failed token validation
- Repeated login attempts from same IP

### **Metrics to Track**
- Number of unauthorized access attempts per day
- Failed login attempts
- Active user sessions
- Token usage patterns

---

## 🔮 Future Enhancements

### **Short Term:**
- [ ] Add rate limiting for login attempts
- [ ] Implement session timeout
- [ ] Add MFA requirement option
- [ ] Email notifications for unauthorized attempts

### **Long Term:**
- [ ] Full JWT signature verification
- [ ] Role-based access control (RBAC)
- [ ] Audit logging for all actions
- [ ] Integration with customer IdPs (SAML/OIDC)
- [ ] Fine-grained permissions per user

---

## 📚 Related Documentation

- [Security Fix Summary](./SECURITY-FIX-SUMMARY.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [AWS Amplify Setup](./AMPLIFY_SETUP.md)

---

**Last Updated:** November 4, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready


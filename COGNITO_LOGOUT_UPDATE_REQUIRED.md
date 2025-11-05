# ⚠️ CRITICAL: Update Cognito Logout URLs

## Issue
Logout is not properly clearing sessions because Cognito doesn't have the logout redirect URI configured.

## Required AWS Console Changes

### 1. Open AWS Cognito Console
```
https://console.aws.amazon.com/cognito/v2/idp/user-pools?region=us-east-1
```

### 2. Select User Pool
- Click: **ilminate-customer-portal-jqo56pdt**

### 3. Navigate to App Client
- Left sidebar → **App integration**
- Scroll to **App clients and analytics**
- Click on app client: **Client ID: `1uoiq3h1afgo6799gie48vmlcj`**

### 4. Edit Hosted UI Settings
Click **Edit** in the Hosted UI section

### 5. Add Allowed Sign-Out URLs

Find the **Allowed sign-out URLs** field and add:

```
https://apex.ilminate.com/login
http://localhost:3000/login
```

**Complete list should be:**
```
https://apex.ilminate.com/login
http://localhost:3000/login
```

### 6. Verify Callback URLs (from previous update)

Make sure **Allowed callback URLs** includes:
```
https://apex.ilminate.com/
https://apex.ilminate.com/api/auth/callback
http://localhost:3000/api/auth/callback
```

### 7. Save Changes
Click **Save changes** at the bottom

---

## What This Fixes

**Before:**
- Logout only cleared APEX cookies
- Cognito session remained active
- Google OAuth session remained active
- Auto-logged back in with same account

**After:**
- Logout redirects to Cognito logout endpoint
- Properly terminates Cognito session
- Clears Google OAuth session
- Can sign in with different Google account

---

## Testing After Update

1. **Log in** with cjfisher84@googlemail.com
2. **Click logout** (top right menu)
3. Should redirect to login page
4. **Click "Sign in with Google"**
5. Should now show Google account picker (not auto-login)
6. Can choose different account (e.g., Land Sea Air)

---

## Alternative for Testing (While Waiting for Config)

**Use Incognito Window:**
```
1. Open incognito window (Cmd+Shift+N)
2. Go to: https://apex.ilminate.com/login
3. Click "Sign in with Google"
4. Sign in with Land Sea Air account
5. Test complete multi-tenant experience
```

This bypasses the auto-login issue without needing the Cognito config update.

---

## Priority

- **For Testing**: Use incognito window (immediate)
- **For Production**: Update Cognito config (5 minutes)

Once Cognito is updated and code is deployed, logout will work properly for all users.


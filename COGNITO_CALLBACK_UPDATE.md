# Cognito Callback URL Update - REQUIRED

## ⚠️ CRITICAL: Update Cognito Redirect URI

The authentication flow has been fixed, but you need to update the Cognito User Pool configuration to allow the new callback URL.

## Steps to Update

### 1. Open AWS Cognito Console

```
https://console.aws.amazon.com/cognito/v2/idp/user-pools?region=us-east-1
```

### 2. Select the User Pool

- Click on: **ilminate-customer-portal-jqo56pdt**

### 3. Navigate to App Integration

- In the left sidebar, click **App integration**
- Scroll down to **App clients and analytics**
- Click on your app client (Client ID: `1uoiq3h1afgo6799gie48vmlcj`)

### 4. Update Allowed Callback URLs

In the **Hosted UI settings** section, find **Allowed callback URLs** and add:

```
https://apex.ilminate.com/api/auth/callback
```

**Current URL (keep this too):**
```
https://apex.ilminate.com/
```

**Final list should include BOTH:**
```
https://apex.ilminate.com/
https://apex.ilminate.com/api/auth/callback
```

### 5. Save Changes

- Click **Save changes** at the bottom

### 6. Test the Login

1. Go to: https://apex.ilminate.com/login
2. Click **Sign in with Google**
3. Authenticate with Google
4. You should be redirected to the home page and stay logged in

## What Was Fixed

### Before (Broken):
1. User clicks "Sign in with Google"
2. Cognito redirects back with `?code=...`
3. Code was never exchanged for tokens
4. No session cookies were set
5. On next page load → redirected back to /login

### After (Fixed):
1. User clicks "Sign in with Google"
2. Cognito redirects to `/api/auth/callback?code=...`
3. **NEW**: Callback handler exchanges code for tokens
4. **NEW**: Session cookies are set (idToken, accessToken, refreshToken)
5. User is redirected to home page with valid session
6. Middleware recognizes valid session → allows access

## Files Changed

- ✅ **New**: `src/app/api/auth/callback/route.ts` - OAuth callback handler
- ✅ **New**: `src/app/api/auth/logout/route.ts` - Logout handler
- ✅ **Updated**: `src/app/login/page.tsx` - Fixed redirect URI
- ✅ **Updated**: `src/middleware.ts` - Removed incomplete OAuth handling
- ✅ **Updated**: `src/app/page.tsx` - Added logout button to home page header
- ✅ **Updated**: `src/app/investigations/page.tsx` - Added logout button to header
- ✅ **Updated**: `src/app/triage/page.tsx` - Added logout button to header

## Logout Functionality

Users can now log out by clicking the **Logout** button in the header on any page, or by visiting:
```
https://apex.ilminate.com/api/auth/logout
```

This will:
1. Clear all Cognito session cookies
2. Redirect to the login page

### Logout Button Placement

Logout buttons have been added to:
- ✅ **Home Page** (`/`) - Top right header
- ✅ **Investigations Page** (`/investigations`) - Top right header
- ✅ **Triage Page** (`/triage`) - Top right header

The button is styled consistently with the theme colors and is responsive for mobile devices.

### Adding Logout to Other Pages

To add a logout button to additional pages:

```tsx
<Link href="/api/auth/logout" passHref legacyBehavior>
  <Button 
    variant="outlined" 
    component="a" 
    size="large"
    sx={{ 
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
      px: 4,
      py: 1.5,
      fontSize: '1.1rem',
      fontWeight: 600,
      '&:hover': { 
        borderColor: '#005555',
        bgcolor: 'rgba(0, 112, 112, 0.05)'
      }
    }}
  >
    Logout
  </Button>
</Link>
```

## Testing Checklist

After updating Cognito:

- [ ] Google OAuth login works
- [ ] Microsoft OAuth login works (if configured)
- [ ] Token login still works
- [ ] Session persists across page reloads
- [ ] Logout works correctly

## Troubleshooting

If login still doesn't work:

1. **Check browser cookies**: Open DevTools → Application → Cookies
   - Should see cookies starting with `CognitoIdentityServiceProvider.1uoiq3h1afgo6799gie48vmlcj.`

2. **Check Network tab**: Look for:
   - POST to `/oauth2/token` (should return 200)
   - Redirect to `/` (should have Set-Cookie headers)

3. **Check Console logs**: Middleware logs authentication attempts

4. **Clear cookies**: Try logging in with a fresh browser session

## Need Help?

If issues persist, check:
- Cognito User Pool is in `us-east-1`
- Google Identity Provider is configured
- App client secret matches (if using client secret)


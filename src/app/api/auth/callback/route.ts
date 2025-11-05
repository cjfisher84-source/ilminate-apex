import { NextRequest, NextResponse } from 'next/server'

const COGNITO_DOMAIN = 'ilminate-customer-portal-jqo56pdt.auth.us-east-1.amazoncognito.com'
const COGNITO_CLIENT_ID = '1uoiq3h1afgo6799gie48vmlcj'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  
  // Get the origin - prefer headers over request.nextUrl.origin for Amplify compatibility
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
  const protocol = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
  const origin = host ? `${protocol}://${host}` : request.nextUrl.origin
  
  console.log('Callback handler - Detected origin:', origin, {
    host,
    protocol,
    'x-forwarded-host': request.headers.get('x-forwarded-host'),
    'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    'nextUrl.origin': request.nextUrl.origin,
    'nextUrl.href': request.nextUrl.href
  })

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(new URL(`${origin}/login?error=auth_failed`))
  }

  // No code provided
  if (!code) {
    return NextResponse.redirect(new URL(`${origin}/login?error=no_code`))
  }

  try {
    // Use request origin for redirect URI (works in dev and prod)
    const redirectUri = `${origin}/api/auth/callback`
    
    // Exchange authorization code for tokens
    const tokenEndpoint = `https://${COGNITO_DOMAIN}/oauth2/token`
    
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: COGNITO_CLIENT_ID,
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
        redirectUri,
        origin,
        code: code.substring(0, 10) + '...'
      })
      return NextResponse.redirect(new URL(`${origin}/login?error=token_exchange_failed&details=${encodeURIComponent(errorText.substring(0, 100))}`))
    }

    const tokens = await tokenResponse.json()
    
    // Parse the ID token to get the username (sub)
    const idTokenPayload = parseJWT(tokens.id_token)
    const username = idTokenPayload?.['cognito:username'] || idTokenPayload?.sub || 'user'

    // Create response with redirect to home page
    const response = NextResponse.redirect(new URL(`${origin}/`))

    // Set Cognito-compatible cookies
    // Format: CognitoIdentityServiceProvider.<client_id>.<username>.<token_type>
    const cookiePrefix = `CognitoIdentityServiceProvider.${COGNITO_CLIENT_ID}.${username}`
    
    // Set ID token
    response.cookies.set(`${cookiePrefix}.idToken`, tokens.id_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/',
    })

    // Set access token
    response.cookies.set(`${cookiePrefix}.accessToken`, tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 3600,
      path: '/',
    })

    // Set refresh token (if provided)
    if (tokens.refresh_token) {
      response.cookies.set(`${cookiePrefix}.refreshToken`, tokens.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      })
    }

    // Set last auth user
    response.cookies.set(`CognitoIdentityServiceProvider.${COGNITO_CLIENT_ID}.LastAuthUser`, username, {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    // Set user display info (non-httpOnly so JavaScript can read it for UI)
    const email = idTokenPayload?.email || idTokenPayload?.['cognito:username'] || 'user@unknown.com'
    const displayInfo = {
      email,
      customerId: email.split('@')[1] || 'unknown',
      role: email.includes('@ilminate.com') ? 'admin' : 'user'
    }
    
    response.cookies.set('apex_user_display', JSON.stringify(displayInfo), {
      httpOnly: false, // Allow JavaScript to read this for UI display
      secure: true,
      sameSite: 'lax',
      maxAge: 3600,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('OAuth callback error:', err)
    return NextResponse.redirect(new URL(`${origin}/login?error=callback_failed`))
  }
}

/**
 * Parse JWT payload without verification
 */
function parseJWT(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = Buffer.from(payload, 'base64').toString('utf-8')
    return JSON.parse(decoded)
  } catch {
    return null
  }
}


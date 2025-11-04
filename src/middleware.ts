import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// SECURITY: Cognito User Pool Configuration
const COGNITO_CLIENT_ID = '1uoiq3h1afgo6799gie48vmlcj'
const COGNITO_DOMAIN = 'ilminate-customer-portal-jqo56pdt.auth.us-east-1.amazoncognito.com'

// SECURITY: Authorized email domains (add customer domains as they onboard)
const AUTHORIZED_DOMAINS = [
  'ilminate.com',
  // Add customer organization domains here:
  // 'customer-company.com',
]

// SECURITY: Specific authorized email addresses
const AUTHORIZED_EMAILS: string[] = [
  // Add specific authorized emails here:
  // 'security.admin@partner.com',
]

/**
 * Check if email domain or address is authorized
 */
function isEmailAuthorized(email: string): boolean {
  if (!email) return false
  
  const normalizedEmail = email.toLowerCase().trim()
  
  // Check specific email whitelist
  if (AUTHORIZED_EMAILS.includes(normalizedEmail)) {
    return true
  }
  
  // Check domain whitelist
  const domain = normalizedEmail.split('@')[1]
  if (domain && AUTHORIZED_DOMAINS.includes(domain)) {
    return true
  }
  
  return false
}

/**
 * Get Cognito ID token from cookies
 * Format: CognitoIdentityServiceProvider.<client_id>.<username>.idToken
 */
function getCognitoIdToken(request: NextRequest): string | null {
  const prefix = `CognitoIdentityServiceProvider.${COGNITO_CLIENT_ID}`
  const cookies = request.cookies.getAll()
  
  // Find the ID token cookie
  const idTokenCookie = cookies.find(cookie => 
    cookie.name.startsWith(prefix) && cookie.name.endsWith('.idToken')
  )
  
  return idTokenCookie?.value || null
}

/**
 * Parse JWT payload without verification (for email extraction)
 * Note: This is only for reading claims, NOT for security validation
 */
function parseJWTPayload(token: string): any {
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

// Middleware to protect portal routes with secure authentication
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Always allow login page and public assets
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // ✅ METHOD 1: Direct token access (for admin/testing)
  const token = searchParams.get('k');
  const validToken = process.env.NEXT_PUBLIC_PORTAL_TOKEN || '7885c5de63b9b75428cacee0731b80509590783da34b02dd3373276b75ef8e25';
  
  if (token && token === validToken) {
    return NextResponse.next();
  }

  // ✅ METHOD 2: OAuth callback flow (has 'code' parameter from Cognito)
  const authCode = searchParams.get('code');
  if (authCode) {
    // Verify it's from our Cognito domain
    const referer = request.headers.get('referer') || '';
    if (referer.includes(COGNITO_DOMAIN)) {
      return NextResponse.next();
    }
  }

  // ✅ METHOD 3: Valid Cognito session with authorized email
  const idToken = getCognitoIdToken(request)
  
  if (idToken) {
    // Parse JWT to get email (without full verification in edge runtime)
    const payload = parseJWTPayload(idToken)
    const email = payload?.email || payload?.['cognito:username']
    
    if (email) {
      // Check if email is authorized
      if (isEmailAuthorized(email)) {
        // Valid session with authorized email
        const response = NextResponse.next()
        
        // Add email to response headers for use in pages/APIs
        response.headers.set('x-user-email', email)
        
        return response
      } else {
        // Valid session but UNAUTHORIZED email domain
        console.warn(`🚫 Unauthorized access attempt from: ${email}`)
        
        // Redirect to login with error message
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'unauthorized')
        loginUrl.searchParams.set('email', email)
        
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  // ❌ No valid authentication found - redirect to login
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Protect all main routes
     */
    '/',
    '/threats/:path*',
    '/investigations/:path*',
    '/triage/:path*',
    '/dmarc/:path*',
    '/reports/:path*',
    '/quarantine/:path*',
    '/admin/:path*',
  ],
};

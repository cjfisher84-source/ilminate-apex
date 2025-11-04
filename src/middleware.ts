import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// MULTI-TENANT SaaS: Cognito User Pool Configuration
const COGNITO_CLIENT_ID = '1uoiq3h1afgo6799gie48vmlcj'
const COGNITO_DOMAIN = 'ilminate-customer-portal-jqo56pdt.auth.us-east-1.amazoncognito.com'

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

/**
 * Extract customer/tenant ID from email domain
 * e.g., "admin@acme.com" → "acme.com"
 */
function getCustomerIdFromEmail(email: string): string | null {
  if (!email) return null
  
  const parts = email.split('@')
  if (parts.length !== 2) return null
  
  return parts[1].toLowerCase() // Return domain as customer ID
}

// MULTI-TENANT Middleware - Allow any authenticated user, extract their tenant
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Always allow login page and public assets
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // ✅ METHOD 1: Direct token access (for ilminate admin/testing only)
  const token = searchParams.get('k');
  const validToken = process.env.NEXT_PUBLIC_PORTAL_TOKEN || '7885c5de63b9b75428cacee0731b80509590783da34b02dd3373276b75ef8e25';
  
  if (token && token === validToken) {
    const response = NextResponse.next()
    // Admin access - set special customer ID
    response.headers.set('x-user-email', 'admin@ilminate.com')
    response.headers.set('x-customer-id', 'ilminate.com')
    response.headers.set('x-user-role', 'admin')
    return response
  }

  // ✅ METHOD 2: Valid Cognito session - MULTI-TENANT
  const idToken = getCognitoIdToken(request)
  
  if (idToken) {
    // Parse JWT to get email
    const payload = parseJWTPayload(idToken)
    const email = payload?.email || payload?.['cognito:username']
    
    if (email) {
      // Extract customer/tenant ID from email domain
      const customerId = getCustomerIdFromEmail(email)
      
      if (customerId) {
        // ✅ ALLOW ACCESS - Multi-tenant SaaS model
        const response = NextResponse.next()
        
        // Set headers for API routes to use
        response.headers.set('x-user-email', email)
        response.headers.set('x-customer-id', customerId) // e.g., "acme.com"
        response.headers.set('x-user-role', customerId === 'ilminate.com' ? 'admin' : 'customer')
        
        console.log(`✅ Authenticated: ${email} → Customer: ${customerId}`)
        
        return response
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

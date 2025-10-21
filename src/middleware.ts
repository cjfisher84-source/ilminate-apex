import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware to protect portal routes with token or Cognito SSO
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Always allow login page and public assets
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Allow OAuth callback (has 'code' parameter from Cognito)
  const authCode = searchParams.get('code');
  if (authCode) {
    return NextResponse.next();
  }

  // Get token from query parameter (direct access)
  const token = searchParams.get('k');
  const validToken = process.env.NEXT_PUBLIC_PORTAL_TOKEN || '7885c5de63b9b75428cacee0731b80509590783da34b02dd3373276b75ef8e25';
  
  // Allow if valid token is provided
  if (token && token === validToken) {
    return NextResponse.next();
  }
  
  // Check for ANY Cognito-related cookies (Google OAuth, Microsoft OAuth, etc.)
  const cookies = request.cookies;
  const hasCognitoAuth = 
    cookies.get('cognito_session') ||
    cookies.get('CognitoIdentityServiceProvider') ||
    Array.from(cookies.getAll()).some(cookie => 
      cookie.name.includes('CognitoIdentityServiceProvider') ||
      cookie.name.includes('idToken') ||
      cookie.name.includes('accessToken') ||
      cookie.name.includes('refreshToken')
    );
  
  if (hasCognitoAuth) {
    return NextResponse.next();
  }
  
  // Check if user came from Cognito (OAuth flow)
  const referer = request.headers.get('referer');
  if (referer && (referer.includes('amazoncognito.com') || referer.includes('accounts.google.com') || referer.includes('login.microsoftonline.com'))) {
    return NextResponse.next();
  }
  
  // Otherwise redirect to custom login page
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
    '/admin/:path*',
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware to protect portal routes with token or Cognito SSO
export function middleware(request: NextRequest) {
  // Get token from query parameter
  const token = request.nextUrl.searchParams.get('k');
  const validToken = process.env.NEXT_PUBLIC_PORTAL_TOKEN || '7885c5de63b9b75428cacee0731b80509590783da34b02dd3373276b75ef8e25';
  
  // Allow if valid token is provided
  if (token && token === validToken) {
    return NextResponse.next();
  }
  
  // Check if user has a valid session cookie (from Cognito callback)
  const sessionCookie = request.cookies.get('cognito_session');
  if (sessionCookie) {
    return NextResponse.next();
  }
  
  // Otherwise redirect to Cognito login
  const loginUrl = new URL(
    'https://ilminate-customer-portal-jqo56pdt.auth.us-east-1.amazoncognito.com/login'
  );
  loginUrl.searchParams.set('client_id', '1uoiq3h1afgo6799gie48vmlcj');
  loginUrl.searchParams.set('response_type', 'code');
  loginUrl.searchParams.set('scope', 'email openid profile');
  loginUrl.searchParams.set('redirect_uri', `https://apex.ilminate.com/`);
  
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
    '/admin/:path*',
  ],
};


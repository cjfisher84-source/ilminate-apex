import { NextRequest, NextResponse } from 'next/server'

const COGNITO_CLIENT_ID = '1uoiq3h1afgo6799gie48vmlcj'
const COGNITO_DOMAIN = 'ilminate-customer-portal-jqo56pdt.auth.us-east-1.amazoncognito.com'

export async function GET(request: NextRequest) {
  // Get the origin from headers (Amplify-compatible)
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
  const protocol = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
  const origin = host ? `${protocol}://${host}` : request.nextUrl.origin
  
  console.log('Logout - Detected origin:', origin)
  
  // Redirect to Cognito logout endpoint
  // This properly clears the Cognito session AND the federated Google session
  const logoutUrl = new URL(`https://${COGNITO_DOMAIN}/logout`)
  logoutUrl.searchParams.set('client_id', COGNITO_CLIENT_ID)
  logoutUrl.searchParams.set('logout_uri', `${origin}/login`)
  
  console.log('Redirecting to Cognito logout:', logoutUrl.toString())
  
  // Create response that redirects to Cognito logout
  const response = NextResponse.redirect(logoutUrl)

  // Get all cookies to find Cognito session cookies
  const cookies = request.cookies.getAll()
  
  // Delete all Cognito-related cookies
  const cognitoPrefix = `CognitoIdentityServiceProvider.${COGNITO_CLIENT_ID}`
  
  cookies.forEach(cookie => {
    if (cookie.name.startsWith(cognitoPrefix)) {
      response.cookies.delete(cookie.name)
    }
  })

  // Also clear the LastAuthUser cookie
  response.cookies.delete(`CognitoIdentityServiceProvider.${COGNITO_CLIENT_ID}.LastAuthUser`)
  
  // Clear the user display cookie
  response.cookies.delete('apex_user_display')

  return response
}

export async function POST(request: NextRequest) {
  // Support both GET and POST for logout
  return GET(request)
}


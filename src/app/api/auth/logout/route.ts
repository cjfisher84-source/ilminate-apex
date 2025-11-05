import { NextRequest, NextResponse } from 'next/server'

const COGNITO_CLIENT_ID = '1uoiq3h1afgo6799gie48vmlcj'

export async function GET(request: NextRequest) {
  // Get the origin from headers (Amplify-compatible)
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
  const protocol = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
  const origin = host ? `${protocol}://${host}` : request.nextUrl.origin
  
  console.log('Logout - Detected origin:', origin)
  
  // Create response that redirects to login
  const response = NextResponse.redirect(new URL(`${origin}/login`))

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


import { NextRequest, NextResponse } from 'next/server'

const COGNITO_CLIENT_ID = '1uoiq3h1afgo6799gie48vmlcj'

export async function GET(request: NextRequest) {
  // Create response that redirects to login
  const response = NextResponse.redirect(new URL('/login', request.url))

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

  return response
}

export async function POST(request: NextRequest) {
  // Support both GET and POST for logout
  return GET(request)
}


/**
 * Authentication Utilities for APEX
 * Handles Cognito JWT validation and authorization
 */

import { jwtVerify } from 'jose'

// Cognito configuration
const COGNITO_REGION = 'us-east-1'
const COGNITO_USER_POOL_ID = 'us-east-1_jqo56pdt'
const COGNITO_CLIENT_ID = '1uoiq3h1afgo6799gie48vmlcj'

// Authorized email domains (whitelist)
export const AUTHORIZED_DOMAINS: string[] = [
  'ilminate.com',
  // Add customer domains here as they onboard
  // 'customer-company.com',
]

// Specific authorized email addresses (for non-domain access)
export const AUTHORIZED_EMAILS: string[] = [
  // Add specific authorized emails here
  // 'user@personal-email.com',
]

/**
 * Get Cognito JWKS (JSON Web Key Set) URL
 */
function getCognitoJWKSUrl(): string {
  return `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/jwks.json`
}

/**
 * Validate Cognito JWT token
 * @param token - The JWT token to validate
 * @returns Decoded token payload if valid, null if invalid
 */
export async function validateCognitoToken(token: string): Promise<any | null> {
  try {
    // Verify JWT signature and claims
    const JWKS = await fetch(getCognitoJWKSUrl()).then(res => res.json())
    
    // Create a JWKS endpoint from the response
    const getKey = async (header: any) => {
      const key = JWKS.keys.find((k: any) => k.kid === header.kid)
      if (!key) throw new Error('Key not found')
      return key
    }
    
    // Verify the token
    const { payload } = await jwtVerify(token, async (header) => {
      const key = await getKey(header)
      return await importJWK(key)
    }, {
      issuer: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
      audience: COGNITO_CLIENT_ID,
    })

    return payload
  } catch (error) {
    console.error('JWT validation failed:', error)
    return null
  }
}

/**
 * Import JWK (JSON Web Key) for verification
 */
async function importJWK(jwk: any) {
  const algorithm = jwk.alg || 'RS256'
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  )
}

/**
 * Check if email is authorized to access the portal
 * @param email - User email address
 * @returns true if authorized, false otherwise
 */
export function isEmailAuthorized(email: string): boolean {
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
 * Extract email from Cognito JWT payload
 * @param payload - Decoded JWT payload
 * @returns Email address or null
 */
export function getEmailFromToken(payload: any): string | null {
  return payload?.email || payload?.['cognito:username'] || null
}

/**
 * Validate Cognito cookie and check authorization
 * @param cookieValue - The Cognito token from cookie
 * @returns { valid: boolean, email?: string, reason?: string }
 */
export async function validateAuthCookie(cookieValue: string): Promise<{
  valid: boolean
  email?: string
  reason?: string
}> {
  // Validate JWT token
  const payload = await validateCognitoToken(cookieValue)
  
  if (!payload) {
    return { valid: false, reason: 'Invalid token' }
  }

  // Extract email
  const email = getEmailFromToken(payload)
  
  if (!email) {
    return { valid: false, reason: 'No email in token' }
  }

  // Check authorization
  if (!isEmailAuthorized(email)) {
    return { 
      valid: false, 
      email, 
      reason: 'Email not authorized for this portal' 
    }
  }

  return { valid: true, email }
}

/**
 * Get Cognito ID token from cookies
 * Cognito stores tokens in format: CognitoIdentityServiceProvider.<client_id>.<username>.idToken
 * @param cookies - Request cookies
 * @returns ID token or null
 */
export function getCognitoTokenFromCookies(cookies: any): string | null {
  // Look for Cognito ID token cookie
  const prefix = `CognitoIdentityServiceProvider.${COGNITO_CLIENT_ID}`
  
  // Get all cookies
  const allCookies = Array.from(cookies.getAll())
  
  // Find the idToken cookie
  const idTokenCookie = allCookies.find((cookie: any) => 
    cookie.name.startsWith(prefix) && cookie.name.endsWith('.idToken')
  ) as { name: string; value: string } | undefined
  
  return idTokenCookie ? idTokenCookie.value : null
}


/**
 * Authorized Users and Domains Configuration
 * 
 * This file manages who can access the APEX portal.
 * Update this file to add or remove authorized users/domains.
 */

/**
 * Authorized email domains
 * Users with emails from these domains will be granted access
 */
export const AUTHORIZED_DOMAINS: string[] = [
  'ilminate.com',
  // Add customer organization domains here as they onboard
  // Example:
  // 'acme-corp.com',
  // 'customer-company.com',
]

/**
 * Authorized individual email addresses
 * Specific emails that should have access, even if their domain isn't in the list above
 */
export const AUTHORIZED_EMAILS: string[] = [
  // Add specific authorized emails here
  // Example:
  // 'cfo@partner-company.com',
  // 'security.team@client.com',
]

/**
 * Admin email addresses
 * These users have full administrative access
 */
export const ADMIN_EMAILS: string[] = [
  // Add admin emails here
  // Example: 'admin@ilminate.com',
]

/**
 * Check if an email is authorized
 */
export function isEmailAuthorized(email: string): boolean {
  if (!email) return false

  const normalizedEmail = email.toLowerCase().trim()

  // Check specific email whitelist
  if (AUTHORIZED_EMAILS.includes(normalizedEmail)) {
    return true
  }

  // Check admin list
  if (ADMIN_EMAILS.includes(normalizedEmail)) {
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
 * Check if an email is an admin
 */
export function isAdmin(email: string): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase().trim())
}

/**
 * Get user role based on email
 */
export function getUserRole(email: string): 'admin' | 'user' | 'unauthorized' {
  if (!email) return 'unauthorized'
  
  if (isAdmin(email)) return 'admin'
  if (isEmailAuthorized(email)) return 'user'
  
  return 'unauthorized'
}


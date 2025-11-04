/**
 * Multi-Tenant Utility Functions
 * 
 * Handles customer/tenant isolation in a SaaS model
 */

/**
 * Extract customer ID from email domain
 * @param email - User email address (e.g., "admin@acme.com")
 * @returns Customer ID (e.g., "acme.com")
 */
export function getCustomerIdFromEmail(email: string): string | null {
  if (!email) return null
  
  const parts = email.split('@')
  if (parts.length !== 2) return null
  
  return parts[1].toLowerCase()
}

/**
 * Get customer ID from request headers (set by middleware)
 * @param headers - Next.js request headers
 * @returns Customer ID or null
 */
export function getCustomerIdFromHeaders(headers: Headers): string | null {
  return headers.get('x-customer-id')
}

/**
 * Get user email from request headers (set by middleware)
 * @param headers - Next.js request headers
 * @returns User email or null
 */
export function getUserEmailFromHeaders(headers: Headers): string | null {
  return headers.get('x-user-email')
}

/**
 * Get user role from request headers (set by middleware)
 * @param headers - Next.js request headers
 * @returns User role ('admin' | 'customer') or null
 */
export function getUserRoleFromHeaders(headers: Headers): 'admin' | 'customer' | null {
  const role = headers.get('x-user-role')
  if (role === 'admin' || role === 'customer') return role
  return null
}

/**
 * Check if user is an ilminate admin
 * @param headers - Next.js request headers
 * @returns true if user is admin
 */
export function isAdmin(headers: Headers): boolean {
  return getUserRoleFromHeaders(headers) === 'admin'
}

/**
 * Format customer ID for display
 * e.g., "acme.com" → "Acme Corp"
 */
export function formatCustomerName(customerId: string): string {
  if (!customerId) return 'Unknown Customer'
  
  // Remove TLD and capitalize
  const name = customerId.split('.')[0]
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/**
 * Validate that a customer can access a resource
 * @param resourceCustomerId - Customer ID of the resource
 * @param userCustomerId - Customer ID of the requesting user
 * @param userRole - Role of the requesting user
 * @returns true if access is allowed
 */
export function canAccessResource(
  resourceCustomerId: string,
  userCustomerId: string,
  userRole: 'admin' | 'customer' | null
): boolean {
  // Admins can access everything
  if (userRole === 'admin') return true
  
  // Customers can only access their own data
  return resourceCustomerId === userCustomerId
}

/**
 * Build DynamoDB query parameters with customer ID filter
 * Ensures row-level security for multi-tenant data
 */
export function buildCustomerQuery(
  customerId: string,
  additionalParams: Record<string, any> = {}
): Record<string, any> {
  return {
    KeyConditionExpression: 'customerId = :customerId',
    ExpressionAttributeValues: {
      ':customerId': customerId,
      ...additionalParams
    }
  }
}


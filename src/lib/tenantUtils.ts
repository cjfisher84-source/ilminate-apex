/**
 * Multi-Tenant Utilities
 * 
 * Provides customer-specific branding, feature toggles, and configuration
 * for the APEX platform.
 */

export interface CustomerBranding {
  customerId: string
  companyName: string
  shortName: string
  logo: {
    primary: string
    width: number
    height: number
    alt: string
  }
  theme?: {
    primaryColor: string
    secondaryColor: string
  }
  tagline?: string
}

export interface CustomerFeatures {
  email_security: boolean
  dmarc_monitoring: boolean
  apex_trace: boolean
  ai_triage: boolean
  investigations: boolean
  quarantine: boolean
  harborsim: boolean
  edr: boolean
  edr_endpoints: boolean
  edr_metrics: boolean
  edr_threats: boolean
  attack_reports: boolean
  security_events: boolean
  notifications: boolean
  mockData: boolean
}

/**
 * Customer-specific branding configuration
 */
export const CUSTOMER_BRANDING: Record<string, CustomerBranding> = {
  'landseaair-nc.com': {
    customerId: 'landseaair-nc.com',
    companyName: 'Land Sea Air',
    shortName: 'LSA',
    logo: {
      primary: '/logos/landseaair-logo.png',
      width: 60,
      height: 60,
      alt: 'Land Sea Air Logo'
    },
    theme: {
      primaryColor: '#2D5016', // Dark green from their logo
      secondaryColor: '#8FBE00' // Lime green from their logo
    },
    tagline: 'Best Shipping Since Noah'
  }
}

/**
 * Default branding for Ilminate and unknown customers
 */
const DEFAULT_BRANDING: CustomerBranding = {
  customerId: 'default',
  companyName: 'Your Organization',
  shortName: '',
  logo: {
    primary: '/ilminate-logo.png',
    width: 60,
    height: 60,
    alt: 'Organization Logo'
  }
}

/**
 * Customer-specific feature toggles
 */
export const CUSTOMER_FEATURES: Record<string, CustomerFeatures> = {
  'landseaair-nc.com': {
    email_security: true,
    dmarc_monitoring: true,
    apex_trace: true,
    ai_triage: true,
    investigations: true,
    quarantine: true,
    harborsim: true,
    edr: false, // Disabled for Land Sea Air initially
    edr_endpoints: false,
    edr_metrics: false,
    edr_threats: false,
    attack_reports: true,
    security_events: true,
    notifications: true,
    mockData: false // No mock data for Land Sea Air
  }
}

/**
 * Default features (all enabled)
 */
const DEFAULT_FEATURES: CustomerFeatures = {
  email_security: true,
  dmarc_monitoring: true,
  apex_trace: true,
  ai_triage: true,
  investigations: true,
  quarantine: true,
  harborsim: true,
  edr: true,
  edr_endpoints: true,
  edr_metrics: true,
  edr_threats: true,
  attack_reports: true,
  security_events: true,
  notifications: true,
  mockData: true // Show mock data by default
}

/**
 * Get customer branding configuration
 */
export function getCustomerBranding(customerId: string | null): CustomerBranding {
  if (!customerId) return DEFAULT_BRANDING
  return CUSTOMER_BRANDING[customerId] || DEFAULT_BRANDING
}

/**
 * Get customer feature configuration
 */
export function getCustomerFeatures(customerId: string | null): CustomerFeatures {
  if (!customerId) return DEFAULT_FEATURES
  return CUSTOMER_FEATURES[customerId] || DEFAULT_FEATURES
}

/**
 * Check if a specific feature is enabled for a customer
 */
export function isFeatureEnabled(
  customerId: string | null | undefined,
  feature: keyof CustomerFeatures
): boolean {
  const features = getCustomerFeatures(customerId ?? null)
  return features[feature] ?? false
}

/**
 * Check if mock data should be shown for a customer
 */
export function isMockDataEnabled(customerId: string | null | undefined): boolean {
  return isFeatureEnabled(customerId, 'mockData')
}

/**
 * Get customer ID from headers (for server-side components)
 */
export function getCustomerIdFromHeaders(headers: Headers): string | null {
  return headers.get('x-customer-id')
}

/**
 * Get user email from headers (for server-side components)
 */
export function getUserEmailFromHeaders(headers: Headers): string | null {
  return headers.get('x-user-email')
}

/**
 * Get user role from headers (for server-side components)
 */
export function getUserRoleFromHeaders(headers: Headers): string | null {
  return headers.get('x-user-role')
}

/**
 * Check if user is an Ilminate admin
 */
export function isIlminateAdmin(customerId: string | null, email: string | null): boolean {
  return customerId === 'ilminate.com' || email?.endsWith('@ilminate.com') || false
}

/**
 * Feature Flags Configuration
 * Centralized location for all feature flags
 */

export const featureFlags = {
  /**
   * Mobile Optimization Feature Flag
   * When enabled, applies mobile-specific styling, layout adjustments,
   * and performance optimizations for screens ≤768px
   */
  MOBILE_TWEAKS: process.env.NEXT_PUBLIC_MOBILE_TWEAKS === 'true',
} as const

/**
 * Hook to check if mobile tweaks are enabled
 */
export function useMobileTweaks(): boolean {
  return featureFlags.MOBILE_TWEAKS
}

/**
 * Utility to check if current viewport is mobile size
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 768
}

/**
 * Get mobile-aware value based on feature flag and viewport
 */
export function getMobileValue<T>(mobileValue: T, desktopValue: T): T {
  if (!featureFlags.MOBILE_TWEAKS) return desktopValue
  return isMobileViewport() ? mobileValue : desktopValue
}


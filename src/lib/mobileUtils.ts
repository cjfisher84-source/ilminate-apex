/**
 * Mobile Optimization Utilities
 * Helper functions and hooks for mobile-responsive behavior
 */

import { useState, useEffect } from 'react'
import { featureFlags } from './featureFlags'

/**
 * Hook to detect mobile viewport size
 * Returns true if viewport width <= 768px
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (!featureFlags.MOBILE_TWEAKS) {
      setIsMobile(false)
      return
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Initial check
    checkMobile()

    // Listen for resize
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile && featureFlags.MOBILE_TWEAKS
}

/**
 * Get responsive padding values based on mobile flag
 */
export function getResponsivePadding(isMobile: boolean) {
  if (!featureFlags.MOBILE_TWEAKS) return 4
  return isMobile ? 2 : 4
}

/**
 * Get responsive spacing values
 */
export function getResponsiveSpacing(isMobile: boolean, mobileValue: number, desktopValue: number) {
  if (!featureFlags.MOBILE_TWEAKS) return desktopValue
  return isMobile ? mobileValue : desktopValue
}

/**
 * Get responsive font sizes
 */
export function getResponsiveFontSize(isMobile: boolean, variant: 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'body1') {
  if (!featureFlags.MOBILE_TWEAKS) return undefined

  if (!isMobile) return undefined

  // Mobile-optimized font sizes
  const mobileSizes = {
    h3: '1.75rem',
    h4: '1.5rem',
    h5: '1.25rem',
    h6: '1.1rem',
    subtitle1: '0.95rem',
    body1: '0.9rem',
  }

  return mobileSizes[variant]
}

/**
 * Get responsive image size
 */
export function getResponsiveImageSize(isMobile: boolean, desktopSize: number) {
  if (!featureFlags.MOBILE_TWEAKS) return desktopSize
  return isMobile ? Math.floor(desktopSize * 0.6) : desktopSize
}

/**
 * Get responsive chart height
 */
export function getResponsiveChartHeight(isMobile: boolean, desktopHeight: number) {
  if (!featureFlags.MOBILE_TWEAKS) return desktopHeight
  return isMobile ? Math.min(desktopHeight, 320) : desktopHeight
}

/**
 * Get mobile-optimized grid columns
 */
export function getResponsiveGridCols(isMobile: boolean, config: { xs?: string; sm?: string; md?: string; lg?: string }) {
  if (!featureFlags.MOBILE_TWEAKS) return config
  
  if (isMobile) {
    return { xs: '1fr', sm: '1fr', md: config.md, lg: config.lg }
  }
  
  return config
}


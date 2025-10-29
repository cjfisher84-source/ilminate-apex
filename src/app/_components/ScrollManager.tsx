'use client'

import { useEffect, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function ScrollManagerContent() {
  const pathname = usePathname()
  const search = useSearchParams()
  const hasScrolledOnce = useRef(false)

  useEffect(() => {
    // Don't fight explicit anchors
    if (window.location.hash) return

    // First paint after hydration: ensure top once
    if (!hasScrolledOnce.current) {
      hasScrolledOnce.current = true
      window.scrollTo(0, 0)
      return
    }

    // On route/search changes: keep top unless there's a hash
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, search])

  useEffect(() => {
    // Defensive: ensure manual restoration if something toggles it later
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual' } catch {}
  }, [])

  useEffect(() => {
    // Extra guard for BFCache restores
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) window.scrollTo(0, 0) }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  return null
}

export default function ScrollManager() {
  return (
    <Suspense fallback={null}>
      <ScrollManagerContent />
    </Suspense>
  )
}

'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function ScrollManagerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Disable browser auto-restoration so we control scroll position.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
      return () => {
        window.history.scrollRestoration = 'auto';
      };
    }
  }, []);

  // On route/search changes, go to top (unless there is a hash like /#section).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash) return; // let anchor links scroll naturally
    // Use "instant" behavior (non-animated) for best perf.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, searchParams]);

  // Defensive blur to avoid autofocus pulling the page mid-way on first paint.
  useEffect(() => {
    const el = document.activeElement as HTMLElement | null;
    if (el && (el.tagName === 'INPUT' || el.tabIndex >= 0)) el.blur();
  }, []);

  return null;
}

export default function ScrollManager() {
  return (
    <Suspense fallback={null}>
      <ScrollManagerContent />
    </Suspense>
  );
}


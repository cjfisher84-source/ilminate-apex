'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function ScrollManagerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use browser's native scroll restoration for better mobile support
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
      return () => {
        window.history.scrollRestoration = 'auto';
      };
    }
  }, []);

  // Disable auto scroll-to-top on route changes - let browser handle it naturally
  // useEffect(() => {
  //   if (typeof window === 'undefined') return;
  //   if (window.location.hash) return;
  //   const handleRouteChange = () => {
  //     if (window.location.hash) return;
  //     window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  //   };
  //   
  //   const timeoutId = setTimeout(handleRouteChange, 100);
  //   return () => clearTimeout(timeoutId);
  // }, [pathname, searchParams]);

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


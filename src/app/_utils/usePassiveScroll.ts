'use client';

import { useEffect, useRef } from 'react';

export function usePassiveScroll(onFrame: () => void) {
  const tickingRef = useRef(false);

  useEffect(() => {
    const handler = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(() => {
          try { onFrame(); } finally { tickingRef.current = false; }
        });
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [onFrame]);
}


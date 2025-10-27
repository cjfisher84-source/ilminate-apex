'use client';

import Link from 'next/link';

export function HomeLink({ children = 'Home' }: { children?: React.ReactNode }) {
  return (
    // ✅ This ensures Next.js will scroll to the top when navigating to "/"
    <Link href="/" scroll>
      {children}
    </Link>
  );
}


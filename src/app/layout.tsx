import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import '@/styles/dark-mode-overrides.css'
import '@/styles/globals.css'
import ThemeProvider from '@/components/ThemeProvider'
import ScrollManager from './_components/ScrollManager'

export const metadata: Metadata = {
  title: 'Ilminate APEX',
  description: 'AI-powered cybersecurity analysis and triage system',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* **Critical**: stop the browser from restoring a mid-page position BEFORE hydration */}
        <Script id="scroll-restoration" strategy="beforeInteractive">
          {`
            try {
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
              // On initial page load with no hash, ensure top.
              if (!location.hash) {
                window.scrollTo(0, 0);
              }
              // Guard against BFCache restores (Safari/Firefox)
              window.addEventListener('pageshow', function (e) {
                if (e.persisted) window.scrollTo(0, 0);
              });
            } catch {}
          `}
        </Script>
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {/* Client-side safety net (route changes, hash-awareness, etc.) */}
        <ScrollManager />
      </body>
    </html>
  )
}


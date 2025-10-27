import type { Metadata, Viewport } from 'next'
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
      <body>
        <ScrollManager />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}


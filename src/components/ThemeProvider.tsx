'use client'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useState, useEffect, ReactNode } from 'react'
import { lightTheme, darkTheme } from '@/lib/theme'
import { log } from '@/utils/log'

interface ThemeProviderProps {
  children: ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  // Default to dark mode to match the rest of the application
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    // Check system preference on mount
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const systemPrefersDark = mediaQuery.matches
    setIsDarkMode(systemPrefersDark)
    
    log.theme('ThemeProvider initialized', { 
      isDarkMode: systemPrefersDark, 
      systemPreference: systemPrefersDark ? 'dark' : 'light' 
    })

    // Listen for system preference changes
    const handler = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches)
      log.theme('System theme preference changed', { isDarkMode: e.matches })
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const theme = isDarkMode ? darkTheme : lightTheme

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}


'use client'
import { createTheme, ThemeOptions } from '@mui/material/styles'

// Ilminate brand colors
const ILMINATE_TEAL = '#007070'
const ILMINATE_TEAL_DARK = '#005555'
const ILMINATE_GOLD = '#FFD700'
const ILMINATE_GOLD_DARK = '#E6C200'

// Common theme options shared by both modes
const commonThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
}

// Light theme
export const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: ILMINATE_TEAL,
      dark: ILMINATE_TEAL_DARK,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: ILMINATE_GOLD,
      dark: ILMINATE_GOLD_DARK,
      contrastText: '#1a1a1a',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
    divider: '#E0E4E8',
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#3B82F6',
    },
  },
})

// Dark theme
export const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#00a8a8', // Lighter teal for dark mode
      dark: ILMINATE_TEAL,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFD700',
      dark: ILMINATE_GOLD_DARK,
      contrastText: '#1a1a1a',
    },
    background: {
      default: '#0f172a', // Dark slate background
      paper: '#1e293b', // Slightly lighter paper
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    divider: '#334155',
    success: {
      main: '#22c55e',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
  },
})


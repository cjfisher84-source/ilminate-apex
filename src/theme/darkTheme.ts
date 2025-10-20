import { createTheme } from '@mui/material/styles';

// Dark theme configuration for consistent dark mode across all components
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0f172a',  // Slate 900
      paper: '#1e293b',     // Slate 800
    },
    text: {
      primary: '#f1f5f9',   // Slate 100
      secondary: '#94a3b8', // Slate 400
    },
    primary: {
      main: '#00a8a8',      // Teal (matching existing UNCW teal)
      light: '#4DB8B8',
      dark: '#007070',
    },
    secondary: {
      main: '#FFD700',      // Gold (matching existing UNCW gold)
      dark: '#E6C200',
    },
    divider: '#334155',     // Slate 700
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f97316',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          // Disable the white overlay that MUI adds in dark mode
          backgroundImage: 'none !important',
          backgroundColor: '#1e293b',
          borderColor: '#334155',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          borderColor: '#334155',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          borderColor: '#334155',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0f172a',
          color: '#f1f5f9',
        },
      },
    },
  },
});


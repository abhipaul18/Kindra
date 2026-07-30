'use client';

import { createTheme } from '@mui/material/styles';

export const m3Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0052cc',
      light: '#c4d2ff',
      dark: '#003d9b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#006e2a',
      light: '#5cfd80',
      dark: '#00531e',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ffab00',
      light: '#ffddb3',
      dark: '#624000',
      contrastText: '#191c1e',
    },
    error: {
      main: '#ba1a1a',
      light: '#ffdad6',
      dark: '#93000a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#191c1e',
      secondary: '#434654',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.4 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 44,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 82, 204, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 82, 204, 0.08)',
          border: '1px solid rgba(115, 118, 133, 0.2)',
        },
      },
    },
  },
});

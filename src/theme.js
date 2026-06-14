import { createTheme, responsiveFontSizes } from '@mui/material/styles';

export const appColors = {
  primaryPink: '#FF6B9D',
  primaryPurple: '#8B5CF6',
  background: '#FFF5F8',
  surface: '#FFFFFF',
  lavender: '#EDE9FE',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#F3E8FF',
  error: '#EF4444',
};

const theme = createTheme({
  palette: {
    primary: { main: appColors.primaryPink },
    secondary: { main: appColors.primaryPurple },
    error: { main: appColors.error },
    background: {
      default: appColors.background,
      paper: appColors.surface,
    },
    text: {
      primary: appColors.textPrimary,
      secondary: appColors.textSecondary,
    },
  },
  typography: {
    fontFamily: 'Roboto, system-ui, sans-serif',
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          letterSpacing: 0,
          '&:active': { transform: 'scale(.985)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);

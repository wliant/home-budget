import { createTheme, ThemeOptions } from '@mui/material/styles';

// Define color palette
const colors = {
  primary: {
    main: '#667eea',
    light: '#764ba2',
    dark: '#5a67d8',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  secondary: {
    main: '#f093fb',
    light: '#f5576c',
    dark: '#eb3faa',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  info: {
    main: '#4facfe',
    light: '#00f2fe',
    dark: '#3d8bfd',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  warning: {
    main: '#fa709a',
    light: '#fee140',
    dark: '#f8577a',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  success: {
    main: '#43e97b',
    light: '#38f9d7',
    dark: '#2dc653',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  error: {
    main: '#f5576c',
    light: '#f093fb',
    dark: '#d32f2f',
    gradient: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
  },
};

const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
    },
    info: {
      main: colors.info.main,
      light: colors.info.light,
      dark: colors.info.dark,
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
    },
    background: mode === 'dark' 
      ? {
          default: '#0a0e27',
          paper: '#1a1f3a',
        }
      : {
          default: '#f5f7fa',
          paper: '#ffffff',
        },
    text: mode === 'dark'
      ? {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.7)',
        }
      : {
          primary: 'rgba(0, 0, 0, 0.87)',
          secondary: 'rgba(0, 0, 0, 0.6)',
        },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
          },
        },
        contained: {
          background: colors.primary.gradient,
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'dark' 
            ? '0 4px 20px rgba(0, 0, 0, 0.5)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: mode === 'dark'
              ? '0 8px 30px rgba(0, 0, 0, 0.6)'
              : '0 8px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.5)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
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
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          background: mode === 'dark'
            ? 'linear-gradient(180deg, #1a1f3a 0%, #0a0e27 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'dark'
            ? 'linear-gradient(90deg, #1a1f3a 0%, #2d3561 100%)'
            : colors.primary.gradient,
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
        },
      },
    },
  },
});

export const createAppTheme = (mode: 'light' | 'dark') => createTheme(getThemeOptions(mode));

// Export gradients for use in components
export const gradients = {
  primary: colors.primary.gradient,
  secondary: colors.secondary.gradient,
  info: colors.info.gradient,
  warning: colors.warning.gradient,
  success: colors.success.gradient,
  error: colors.error.gradient,
  dark: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
};

// Export individual colors for use in components
export { colors };

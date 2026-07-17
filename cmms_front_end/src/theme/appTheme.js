import { alpha, createTheme } from '@mui/material/styles';

const brand = {
  primary: '#003da5',
  primaryDark: '#002c7a',
  secondary: '#f5b700',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#c62828',
  info: '#0277bd',
};

const appTheme = (mode = 'light') => createTheme({
  palette: {
    mode,
    primary: {
      main: brand.primary,
      light: '#1565c0',
      dark: brand.primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: brand.secondary,
      light: '#ffd54f',
      dark: '#b98200',
      contrastText: '#172033',
    },
    success: { main: brand.success },
    warning: { main: brand.warning },
    error: { main: brand.error },
    info: { main: brand.info },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f4f7fb',
      paper: mode === 'dark' ? '#111827' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#f8fafc' : '#111827',
      secondary: mode === 'dark' ? '#cbd5e1' : '#607083',
    },
    divider: mode === 'dark' ? 'rgba(148, 163, 184, 0.22)' : 'rgba(15, 23, 42, 0.1)',
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(15, 23, 42, 0.06)',
    '0 8px 24px rgba(15, 23, 42, 0.08)',
    '0 12px 32px rgba(15, 23, 42, 0.1)',
    ...Array(21).fill('0 18px 44px rgba(15, 23, 42, 0.14)'),
  ],
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontSize: '1.75rem',
      fontWeight: 800,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.35rem',
      fontWeight: 800,
      lineHeight: 1.25,
    },
    h6: {
      fontWeight: 800,
      lineHeight: 1.3,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overflowX: 'hidden',
        },
        '#root': {
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[1],
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
        fullWidth: true,
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiDialog: {
      defaultProps: {
        fullWidth: true,
      },
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          margin: 16,
          maxWidth: 'calc(100% - 32px)',
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 800,
          paddingBottom: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: 0,
          '--DataGrid-rowBorderColor': theme.palette.divider,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
            fontWeight: 800,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 800,
          },
          '& .MuiDataGrid-cell': {
            outline: 'none !important',
          },
          '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within': {
            outline: `2px solid ${alpha(theme.palette.primary.main, 0.45)}`,
            outlineOffset: -2,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.04),
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${theme.palette.divider}`,
          },
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
        },
      },
    },
  },
});

export default appTheme;

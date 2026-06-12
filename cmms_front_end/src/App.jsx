import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Paper, ThemeProvider, Typography, createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import { useAuth } from './context/AuthContext';
import SidebarLayout from './components/SidebarLayout';
import LoginPage from './pages/LoginPage';
import UserManagementPage from './pages/UserManagementPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EquipmentListPage from './pages/equipment/EquipmentListPage';
import EquipmentFormPage from './pages/equipment/EquipmentFormPage';
import VendorListPage from './pages/vendor/VendorListPage';
import VendorFormPage from './pages/vendor/VendorFormPage';
import MaintenanceRequestPage from './pages/maintenance/MaintenanceRequestPage';
import MaintenanceAssignmentPage from './pages/maintenance/MaintenanceAssignmentPage';
import DowntimePage from './pages/maintenance/DowntimePage';
import PreventiveMaintenancePage from './pages/maintenance/PreventiveMaintenancePage';
import EquipmentHistoryPage from './pages/reports/EquipmentHistoryPage';
import DowntimeAnalysisPage from './pages/reports/DowntimeAnalysisPage';

const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#003da5',
      light: '#1565c0',
      dark: '#002c7a',
    },
    secondary: {
      main: '#ffc107',
      light: '#ffeb3b',
      dark: '#ffb300',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f5f7fb',
      paper: mode === 'dark' ? '#111827' : '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 6,
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#003da5',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PlaceholderPage({ title }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 1 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>{title}</Typography>
      <Box sx={{ color: 'text.secondary' }}>
        <Typography variant="body2">This page will be available soon.</Typography>
      </Box>
    </Paper>
  );
}

function App() {
  const { isAuthenticated, loading } = useAuth();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = React.useState(() => localStorage.getItem('cmmsThemeMode') || (prefersDarkMode ? 'dark' : 'light'));
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  const toggleMode = React.useCallback(() => {
    setMode((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('cmmsThemeMode', next);
      return next;
    });
  }, []);

  if (loading) {
    return null;
  }

  const protectedPage = (page) => (
    <ProtectedRoute>
      <SidebarLayout mode={mode} onToggleMode={toggleMode}>{page}</SidebarLayout>
    </ProtectedRoute>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
          <Route path="/dashboard" element={protectedPage(<DashboardPage />)} />
          <Route path="/equipment" element={protectedPage(<EquipmentListPage />)} />
          <Route path="/equipment/new" element={protectedPage(<EquipmentFormPage />)} />
          <Route path="/equipment/:id" element={protectedPage(<EquipmentFormPage />)} />
          <Route path="/vendors" element={protectedPage(<VendorListPage />)} />
          <Route path="/vendors/new" element={protectedPage(<VendorFormPage />)} />
          <Route path="/vendors/:id" element={protectedPage(<VendorFormPage />)} />
          <Route path="/maintenance/requests" element={protectedPage(<MaintenanceRequestPage />)} />
          <Route path="/maintenance/assignments" element={protectedPage(<MaintenanceAssignmentPage />)} />
          <Route path="/maintenance/downtime" element={protectedPage(<DowntimePage />)} />
          <Route path="/maintenance/preventive" element={protectedPage(<PreventiveMaintenancePage />)} />
          <Route path="/reports/equipment-history" element={protectedPage(<EquipmentHistoryPage />)} />
          <Route path="/reports/downtime-analysis" element={protectedPage(<DowntimeAnalysisPage />)} />
          <Route path="/hr/sites" element={protectedPage(<PlaceholderPage title="Sites" />)} />
          <Route path="/hr/employees" element={protectedPage(<PlaceholderPage title="Employees" />)} />
          <Route path="/create-user" element={protectedPage(<UserManagementPage />)} />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

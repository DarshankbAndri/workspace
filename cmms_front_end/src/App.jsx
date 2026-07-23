import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, useMediaQuery, Box, Paper, Typography } from '@mui/material';
import { useAuth } from './shared/context/AuthContext';
import SidebarLayout from './shared/layouts/SidebarLayout';
import { getFirstAllowedPath } from './shared/utils/permissionRoutes';
import createAppTheme from './theme/appTheme';
import LoginPage from './features/auth/pages/LoginPage';
import UserManagementPage from './features/user/pages/UserManagementPage';
import UserProfilePage from './features/user/pages/UserProfilePage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import EquipmentListPage from './features/equipment/pages/EquipmentListPage';
import EquipmentFormPage from './features/equipment/pages/EquipmentFormPage';
import EquipmentViewPage from './features/equipment/pages/EquipmentViewPage';
import VendorListPage from './features/vendor/pages/VendorListPage';
import VendorFormPage from './features/vendor/pages/VendorFormPage';
import VendorViewPage from './features/vendor/pages/VendorViewPage';
import VendorAmcListPage from './features/vendorAmc/pages/VendorAmcListPage';
import VendorAmcFormPage from './features/vendorAmc/pages/VendorAmcFormPage';
import VendorAmcViewPage from './features/vendorAmc/pages/VendorAmcViewPage';
import MaintenanceRequestListPage from './features/maintenanceRequest/pages/MaintenanceRequestListPage';
import MaintenanceRequestFormPage from './features/maintenanceRequest/pages/MaintenanceRequestFormPage';
import MaintenanceRequestViewPage from './features/maintenanceRequest/pages/MaintenanceRequestViewPage';
import MaintenanceAssignmentListPage from './features/assignment/pages/MaintenanceAssignmentListPage';
import MaintenanceAssignmentFormPage from './features/assignment/pages/MaintenanceAssignmentFormPage';
import MaintenanceAssignmentViewPage from './features/assignment/pages/MaintenanceAssignmentViewPage';
import DowntimeListPage from './features/downtime/pages/DowntimeListPage';
import DowntimeFormPage from './features/downtime/pages/DowntimeFormPage';
import DowntimeViewPage from './features/downtime/pages/DowntimeViewPage';
import PreventiveMaintenanceListPage from './features/preventiveMaintenance/pages/PreventiveMaintenanceListPage';
import PreventiveMaintenanceFormPage from './features/preventiveMaintenance/pages/PreventiveMaintenanceFormPage';
import PreventiveMaintenanceViewPage from './features/preventiveMaintenance/pages/PreventiveMaintenanceViewPage';
import PreventiveMaintenanceCalendarPage from './features/preventiveMaintenance/pages/PreventiveMaintenanceCalendarPage';
import ApprovalInboxPage from './features/approval/pages/ApprovalInboxPage';
import ApprovalHistoryPage from './features/approval/pages/ApprovalHistoryPage';
import NotificationCenterPage from './features/notification/pages/NotificationCenterPage';
import EquipmentHistoryPage from './features/report/pages/EquipmentHistoryPage';
import DowntimeAnalysisPage from './features/report/pages/DowntimeAnalysisPage';
import EquipmentCostReportPage from './features/report/pages/EquipmentCostReportPage';
import SparePartListPage from './features/spareParts/pages/SparePartListPage';
import SparePartFormPage from './features/spareParts/pages/SparePartFormPage';
import SparePartViewPage from './features/spareParts/pages/SparePartViewPage';
import SparePartReorderPage from './features/spareParts/pages/SparePartReorderPage';
import SpareRequestApprovalPage from './features/spareParts/pages/SpareRequestApprovalPage';
import SpareRequestStorePage from './features/spareParts/pages/SpareRequestStorePage';
import SiteListPage from './features/site/pages/SiteListPage';
import SiteFormPage from './features/site/pages/SiteFormPage';
import EmployeeListPage from './features/employee/pages/EmployeeListPage';
import EmployeeFormPage from './features/employee/pages/EmployeeFormPage';
import RoleListPage from './features/admin/pages/RoleListPage';
import RoleFormPage from './features/admin/pages/RoleFormPage';
import RoleViewPage from './features/admin/pages/RoleViewPage';
import PermissionListPage from './features/admin/pages/PermissionListPage';
import UserRoleAssignmentPage from './features/admin/pages/UserRoleAssignmentPage';
import ApprovalConfigPage from './features/approval/pages/ApprovalConfigPage';
import NotificationSettingsPage from './features/notification/pages/NotificationSettingsPage';
import CompanyFormPage from './features/company/pages/CompanyFormPage';

function AccessDenied() {
  return (
    <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <Paper sx={{ p: 3, borderRadius: 1, maxWidth: 420, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Access Denied</Typography>
        <Typography color="text.secondary">Your account does not have permission to open this page.</Typography>
      </Paper>
    </Box>
  );
}

function ProtectedRoute({ children, permission }) {
  const { isAuthenticated, loading, hasPermission } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return hasPermission(permission) ? children : <AccessDenied />;
}

function App() {
  const { isAuthenticated, loading, hasPermission } = useAuth();
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

  const firstAllowedPath = isAuthenticated ? getFirstAllowedPath(hasPermission) : '/login';

  const protectedPage = (page, permission) => (
    <ProtectedRoute permission={permission}>
      <SidebarLayout mode={mode} onToggleMode={toggleMode}>{page}</SidebarLayout>
    </ProtectedRoute>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? firstAllowedPath : '/login'} replace />} />
          <Route path="/dashboard" element={protectedPage(<DashboardPage />, 'DASHBOARD_VIEW')} />
          <Route path="/profile" element={protectedPage(<UserProfilePage />)} />
          <Route path="/equipment" element={protectedPage(<EquipmentListPage />, 'EQUIPMENT_VIEW')} />
          <Route path="/equipment/new" element={protectedPage(<EquipmentFormPage />, 'EQUIPMENT_CREATE')} />
          <Route path="/equipment/:id/view" element={protectedPage(<EquipmentViewPage />, 'EQUIPMENT_VIEW')} />
          <Route path="/equipment/view/:id" element={protectedPage(<EquipmentViewPage />, 'EQUIPMENT_VIEW')} />
          <Route path="/equipment/:id/edit" element={protectedPage(<EquipmentFormPage />, 'EQUIPMENT_UPDATE')} />
          <Route path="/equipment/edit/:id" element={protectedPage(<EquipmentFormPage />, 'EQUIPMENT_UPDATE')} />
          <Route path="/equipment/:id" element={protectedPage(<EquipmentFormPage />, 'EQUIPMENT_UPDATE')} />
          <Route path="/vendors" element={protectedPage(<VendorListPage />, 'VENDOR_VIEW')} />
          <Route path="/vendors/new" element={protectedPage(<VendorFormPage />, 'VENDOR_CREATE')} />
          <Route path="/vendors/:id/view" element={protectedPage(<VendorViewPage />, 'VENDOR_VIEW')} />
          <Route path="/vendors/view/:id" element={protectedPage(<VendorViewPage />, 'VENDOR_VIEW')} />
          <Route path="/vendors/:id/edit" element={protectedPage(<VendorFormPage />, 'VENDOR_UPDATE')} />
          <Route path="/vendors/edit/:id" element={protectedPage(<VendorFormPage />, 'VENDOR_UPDATE')} />
          <Route path="/vendors/:id" element={protectedPage(<VendorFormPage />, 'VENDOR_UPDATE')} />
          <Route path="/vendor-amc" element={protectedPage(<VendorAmcListPage />, 'VENDOR_AMC_VIEW')} />
          <Route path="/vendor-amc/create" element={protectedPage(<VendorAmcFormPage />, 'VENDOR_AMC_CREATE')} />
          <Route path="/vendor-amc/view/:id" element={protectedPage(<VendorAmcViewPage />, 'VENDOR_AMC_VIEW')} />
          <Route path="/vendor-amc/edit/:id" element={protectedPage(<VendorAmcFormPage />, 'VENDOR_AMC_UPDATE')} />
          <Route path="/maintenance/requests" element={protectedPage(<MaintenanceRequestListPage />, 'REQUEST_VIEW')} />
          <Route path="/maintenance/requests/new" element={protectedPage(<MaintenanceRequestFormPage />, 'REQUEST_CREATE')} />
          <Route path="/maintenance/requests/:id/edit" element={protectedPage(<MaintenanceRequestFormPage />, 'REQUEST_UPDATE')} />
          <Route path="/maintenance/requests/:id/view" element={protectedPage(<MaintenanceRequestViewPage />, 'REQUEST_VIEW')} />
          <Route path="/maintenance/requests/view/:id" element={protectedPage(<MaintenanceRequestViewPage />, 'REQUEST_VIEW')} />
          <Route path="/maintenance/assignments" element={protectedPage(<MaintenanceAssignmentListPage />, 'ASSIGNMENT_VIEW')} />
          <Route path="/maintenance/assignments/new" element={protectedPage(<MaintenanceAssignmentFormPage />, 'ASSIGNMENT_CREATE')} />
          <Route path="/maintenance/assignments/:id/edit" element={protectedPage(<MaintenanceAssignmentFormPage />, 'ASSIGNMENT_UPDATE')} />
          <Route path="/maintenance/assignments/:id/view" element={protectedPage(<MaintenanceAssignmentViewPage />, 'ASSIGNMENT_VIEW')} />
          <Route path="/maintenance/assignments/view/:id" element={protectedPage(<MaintenanceAssignmentViewPage />, 'ASSIGNMENT_VIEW')} />
          <Route path="/maintenance/downtime" element={protectedPage(<DowntimeListPage />, 'DOWNTIME_VIEW')} />
          <Route path="/maintenance/downtime/new" element={protectedPage(<DowntimeFormPage />, 'DOWNTIME_CREATE')} />
          <Route path="/maintenance/downtime/:id/edit" element={protectedPage(<DowntimeFormPage />, 'DOWNTIME_UPDATE')} />
          <Route path="/maintenance/downtime/:id/view" element={protectedPage(<DowntimeViewPage />, 'DOWNTIME_VIEW')} />
          <Route path="/maintenance/downtime/view/:id" element={protectedPage(<DowntimeViewPage />, 'DOWNTIME_VIEW')} />
          <Route path="/maintenance/preventive" element={protectedPage(<PreventiveMaintenanceListPage />, 'REQUEST_VIEW')} />
          <Route path="/maintenance/preventive/calendar" element={protectedPage(<PreventiveMaintenanceCalendarPage />, 'PM_CALENDAR_VIEW')} />
          <Route path="/maintenance/preventive/new" element={protectedPage(<PreventiveMaintenanceFormPage />, 'REQUEST_CREATE')} />
          <Route path="/maintenance/preventive/:id/edit" element={protectedPage(<PreventiveMaintenanceFormPage />, 'REQUEST_UPDATE')} />
          <Route path="/maintenance/preventive/:id/view" element={protectedPage(<PreventiveMaintenanceViewPage />, 'REQUEST_VIEW')} />
          <Route path="/maintenance/preventive/view/:id" element={protectedPage(<PreventiveMaintenanceViewPage />, 'REQUEST_VIEW')} />
          <Route path="/approvals/pending" element={protectedPage(<ApprovalInboxPage />, 'APPROVAL_VIEW')} />
          <Route path="/approvals/history" element={protectedPage(<ApprovalHistoryPage />, 'APPROVAL_VIEW')} />
          <Route path="/notifications" element={protectedPage(<NotificationCenterPage />)} />
          <Route path="/reports/equipment-history" element={protectedPage(<EquipmentHistoryPage />, 'REPORT_VIEW')} />
          <Route path="/reports/downtime-analysis" element={protectedPage(<DowntimeAnalysisPage />, 'REPORT_VIEW')} />
          <Route path="/reports/equipment-cost" element={protectedPage(<EquipmentCostReportPage />, 'REPORT_VIEW')} />
          <Route path="/inventory/spare-parts" element={protectedPage(<SparePartListPage />, 'SPARE_PART_VIEW')} />
          <Route path="/inventory/spare-parts/new" element={protectedPage(<SparePartFormPage />, 'SPARE_PART_CREATE')} />
          <Route path="/inventory/spare-parts/:id/edit" element={protectedPage(<SparePartFormPage />, 'SPARE_PART_UPDATE')} />
          <Route path="/inventory/spare-parts/:id/view" element={protectedPage(<SparePartViewPage />, 'SPARE_PART_VIEW')} />
          <Route path="/inventory/spare-parts/view/:id" element={protectedPage(<SparePartViewPage />, 'SPARE_PART_VIEW')} />
          <Route path="/inventory/spare-approvals" element={protectedPage(<SpareRequestApprovalPage />, 'SPARE_USAGE_MANAGER_APPROVE')} />
          <Route path="/inventory/spare-requests" element={protectedPage(<SpareRequestStorePage />, 'SPARE_USAGE_STORE_PROCESS')} />
          <Route path="/inventory/reorders" element={protectedPage(<SparePartReorderPage />, 'REORDER_VIEW')} />
          <Route path="/hr/sites" element={protectedPage(<SiteListPage />, 'SITE_VIEW')} />
          <Route path="/hr/sites/new" element={protectedPage(<SiteFormPage />, 'SITE_CREATE')} />
          <Route path="/hr/sites/:id/edit" element={protectedPage(<SiteFormPage />, 'SITE_UPDATE')} />
          <Route path="/hr/sites/:id/view" element={protectedPage(<SiteFormPage />, 'SITE_VIEW')} />
          <Route path="/hr/sites/view/:id" element={protectedPage(<SiteFormPage />, 'SITE_VIEW')} />
          <Route path="/hr/employees" element={protectedPage(<EmployeeListPage />, 'EMPLOYEE_VIEW')} />
          <Route path="/hr/employees/new" element={protectedPage(<EmployeeFormPage />, 'EMPLOYEE_CREATE')} />
          <Route path="/hr/employees/:id/edit" element={protectedPage(<EmployeeFormPage />, 'EMPLOYEE_UPDATE')} />
          <Route path="/hr/employees/:id/view" element={protectedPage(<EmployeeFormPage />, 'EMPLOYEE_VIEW')} />
          <Route path="/hr/employees/view/:id" element={protectedPage(<EmployeeFormPage />, 'EMPLOYEE_VIEW')} />
          <Route path="/admin/roles" element={protectedPage(<RoleListPage />, 'ROLE_VIEW')} />
          <Route path="/admin/roles/new" element={protectedPage(<RoleFormPage />, 'ROLE_CREATE')} />
          <Route path="/admin/roles/:id/edit" element={protectedPage(<RoleFormPage />, 'ROLE_UPDATE')} />
          <Route path="/admin/roles/:id/view" element={protectedPage(<RoleViewPage />, 'ROLE_VIEW')} />
          <Route path="/admin/roles/view/:id" element={protectedPage(<RoleViewPage />, 'ROLE_VIEW')} />
          <Route path="/admin/permissions" element={protectedPage(<PermissionListPage />, 'PERMISSION_VIEW')} />
          <Route path="/admin/user-roles" element={protectedPage(<UserRoleAssignmentPage />, 'USER_ROLE_VIEW')} />
          <Route path="/admin/approval-config" element={protectedPage(<ApprovalConfigPage />, 'APPROVAL_CONFIG_VIEW')} />
          <Route path="/admin/notification-settings" element={protectedPage(<NotificationSettingsPage />, 'NOTIFICATION_CONFIG_VIEW')} />
          <Route path="/admin/company" element={protectedPage(<CompanyFormPage />, 'COMPANY_VIEW')} />
          <Route path="/create-user" element={protectedPage(<UserManagementPage />, 'USER_ROLE_ASSIGN')} />
          <Route path="*" element={<Navigate to={isAuthenticated ? firstAllowedPath : '/login'} replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

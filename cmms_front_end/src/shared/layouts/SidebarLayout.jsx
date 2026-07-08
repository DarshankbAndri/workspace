import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  ButtonBase,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Assignment,
  AdminPanelSettings,
  Build,
  CalendarMonth,
  Business,
  ChevronLeft,
  ChevronRight,
  DarkMode,
  Dashboard,
  EventRepeat,
  ExpandLess,
  ExpandMore,
  FactCheck,
  History,
  Inventory2,
  LightMode,
  Notifications,
  People,
  Place,
  PrecisionManufacturing,
  Security,
  ShoppingCart,
  Rule,
  Timeline,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import TopNavbar from './TopNavbar';

const drawerWidth = 280;
const collapsedWidth = 76;

const operationGroups = [
  {
    key: 'masters',
    label: 'Masters',
    icon: <Business />,
    paths: ['/equipment', '/vendors'],
    items: [
      { label: 'Equipment', path: '/equipment', icon: <PrecisionManufacturing />, permission: 'EQUIPMENT_VIEW' },
      { label: 'Vendors', path: '/vendors', icon: <People />, permission: 'VENDOR_VIEW' },
    ],
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    icon: <Build />,
    paths: ['/maintenance'],
    items: [
      { label: 'Requests', path: '/maintenance/requests', icon: <Assignment />, permission: 'REQUEST_VIEW' },
      { label: 'Assignments', path: '/maintenance/assignments', icon: <Build />, permission: 'ASSIGNMENT_VIEW' },
      { label: 'Downtime', path: '/maintenance/downtime', icon: <Timeline />, permission: 'DOWNTIME_VIEW' },
      { label: 'Preventive Maintenance', path: '/maintenance/preventive', icon: <EventRepeat />, permission: 'REQUEST_VIEW' },
      { label: 'PM Calendar', path: '/maintenance/preventive/calendar', icon: <CalendarMonth />, permission: 'PM_CALENDAR_VIEW' },
    ]
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: <Inventory2 />,
    paths: ['/inventory'],
    items: [
      { label: 'Spare Parts', path: '/inventory/spare-parts', icon: <Inventory2 />, permission: 'SPARE_PART_VIEW' },
      { label: 'Spare Approval', path: '/inventory/spare-approvals', icon: <FactCheck />, permission: 'SPARE_USAGE_MANAGER_APPROVE' },
      { label: 'Approved Spare Requests', path: '/inventory/spare-requests', icon: <Inventory2 />, permission: 'SPARE_USAGE_STORE_PROCESS' },
      { label: 'Reorder Requests', path: '/inventory/reorders', icon: <ShoppingCart />, permission: 'REORDER_VIEW' },
    ],
  },
  {
    key: 'approvals',
    label: 'Approvals',
    icon: <FactCheck />,
    paths: ['/approvals'],
    items: [
      { label: 'Pending Approvals', path: '/approvals/pending', icon: <FactCheck />, permission: 'APPROVAL_VIEW' },
      { label: 'Approval History', path: '/approvals/history', icon: <History />, permission: 'APPROVAL_VIEW' },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <Timeline />,
    paths: ['/reports'],
    items: [
      { label: 'Equipment History', path: '/reports/equipment-history', icon: <History />, permission: 'REPORT_VIEW' },
      { label: 'Downtime Analysis', path: '/reports/downtime-analysis', icon: <Timeline />, permission: 'REPORT_VIEW' },
      { label: 'Equipment Cost', path: '/reports/equipment-cost', icon: <Timeline />, permission: 'REPORT_VIEW' },
    ],
  },
];

const hrGroups = [
  {
    key: 'creation',
    label: 'Creation',
    icon: <People />,
    paths: ['/hr'],
    items: [
      { label: 'Sites', path: '/hr/sites', icon: <Place />, permission: 'SITE_VIEW' },
      { label: 'Employees', path: '/hr/employees', icon: <People />, permission: 'EMPLOYEE_VIEW' },
    ],
  },
];

const adminGroups = [
  {
    key: 'adminAccess',
    label: 'Access Control',
    icon: <AdminPanelSettings />,
    paths: ['/admin'],
    items: [
      { label: 'Roles', path: '/admin/roles', icon: <Security />, permission: 'ROLE_VIEW' },
      { label: 'Permissions', path: '/admin/permissions', icon: <Security />, permission: 'PERMISSION_VIEW' },
      { label: 'User Roles', path: '/admin/user-roles', icon: <People />, permission: 'USER_ROLE_VIEW' },
      { label: 'Approval Config', path: '/admin/approval-config', icon: <Rule />, permission: 'APPROVAL_CONFIG_VIEW' },
      { label: 'Notification Settings', path: '/admin/notification-settings', icon: <Notifications />, permission: 'NOTIFICATION_CONFIG_VIEW' },
      { label: 'Company Master', path: '/admin/company', icon: <Business />, permission: 'COMPANY_VIEW' },
    ],
  },
];

function SidebarLink({ to, icon, label, nested = false, collapsed, onClick }) {
  const link = (
    <ListItemButton
      component={NavLink}
      to={to}
      onClick={onClick}
      sx={(theme) => ({
        minHeight: 44,
        justifyContent: collapsed ? 'center' : 'flex-start',
        px: collapsed ? 1.5 : nested ? 3.5 : 2,
        mx: 1,
        my: 0.25,
        borderRadius: 1,
        color: 'text.secondary',
        '& .MuiListItemIcon-root': {
          color: 'text.secondary',
        },
        '&.active': {
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.28 : 0.12),
          color: 'primary.main',
          '& .MuiListItemIcon-root': { color: 'primary.main' },
          '&::before': collapsed
            ? {}
            : {
                content: '""',
                position: 'absolute',
                left: 0,
                width: 3,
                height: 24,
                borderRadius: 3,
                bgcolor: 'primary.main',
              },
        },
      })}
    >
      <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, justifyContent: 'center' }}>{icon}</ListItemIcon>
      {!collapsed && <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: nested ? 600 : 700 }} />}
    </ListItemButton>
  );

  return collapsed ? (
    <Tooltip title={label} placement="right">
      {link}
    </Tooltip>
  ) : link;
}

function CategoryButton({ selected, label, collapsed, onClick }) {
  const button = (
    <ButtonBase
      onClick={onClick}
      sx={(theme) => ({
        flex: 1,
        minHeight: 36,
        px: collapsed ? 0 : 1,
        borderRadius: 1,
        color: selected ? 'primary.main' : 'text.secondary',
        bgcolor: selected ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.24 : 0.12) : 'transparent',
        border: `1px solid ${selected ? alpha(theme.palette.primary.main, 0.45) : theme.palette.divider}`,
        fontSize: 13,
        fontWeight: 800,
        '&:hover': {
          bgcolor: selected ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.16) : 'action.hover',
        },
      })}
    >
      {collapsed ? label[0] : label}
    </ButtonBase>
  );

  return collapsed ? (
    <Tooltip title={label} placement="right">
      {button}
    </Tooltip>
  ) : button;
}

function SidebarLayout({ children, mode, onToggleMode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();
  const { hasPermission, hasAnyPermission } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(() => localStorage.getItem('cmmsSidebarCollapsed') === 'true');
  const [selectedCategory, setSelectedCategory] = React.useState('operation');
  const [openGroups, setOpenGroups] = React.useState({
    masters: true,
    maintenance: true,
    approvals: true,
    inventory: true,
    reports: true,
    creation: true,
    adminAccess: true,
  });

  React.useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      setSelectedCategory('admin');
    } else {
      setSelectedCategory(location.pathname.startsWith('/hr') ? 'hr' : 'operation');
    }
  }, [location.pathname]);

  const filterGroups = React.useCallback((groups) => groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPermission(item.permission)),
    }))
    .filter((group) => group.items.length > 0), [hasPermission]);

  const visibleOperationGroups = React.useMemo(() => filterGroups(operationGroups), [filterGroups]);
  const visibleHrGroups = React.useMemo(() => filterGroups(hrGroups), [filterGroups]);
  const visibleAdminGroups = React.useMemo(() => filterGroups(adminGroups), [filterGroups]);
  const canShowOperation = hasAnyPermission(['DASHBOARD_VIEW', 'EQUIPMENT_VIEW', 'VENDOR_VIEW', 'REQUEST_VIEW', 'PM_CALENDAR_VIEW', 'ASSIGNMENT_VIEW', 'DOWNTIME_VIEW', 'SPARE_PART_VIEW', 'SPARE_USAGE_MANAGER_APPROVE', 'SPARE_USAGE_STORE_PROCESS', 'REORDER_VIEW', 'REPORT_VIEW', 'APPROVAL_VIEW']);
  const canShowHr = hasAnyPermission(['SITE_VIEW', 'EMPLOYEE_VIEW']);
  const canShowAdmin = hasAnyPermission(['ROLE_VIEW', 'PERMISSION_VIEW', 'USER_ROLE_VIEW', 'APPROVAL_CONFIG_VIEW', 'NOTIFICATION_CONFIG_VIEW', 'COMPANY_VIEW']);

  React.useEffect(() => {
    const currentGroups = selectedCategory === 'admin' ? visibleAdminGroups : selectedCategory === 'hr' ? visibleHrGroups : visibleOperationGroups;
    const activeGroup = currentGroups.find((group) => group.paths.some((path) => location.pathname.startsWith(path)));
    if (activeGroup) {
      setOpenGroups((current) => ({ ...current, [activeGroup.key]: true }));
    }
  }, [location.pathname, selectedCategory, visibleAdminGroups, visibleHrGroups, visibleOperationGroups]);

  const closeMobile = () => setMobileOpen(false);
  const drawerIsCollapsed = isDesktop && collapsed;
  const currentDrawerWidth = drawerIsCollapsed ? collapsedWidth : drawerWidth;

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem('cmmsSidebarCollapsed', String(next));
      return next;
    });
  };

  const toggleGroup = (groupKey) => {
    if (drawerIsCollapsed) {
      setCollapsed(false);
      localStorage.setItem('cmmsSidebarCollapsed', 'false');
      return;
    }
    setOpenGroups((current) => ({ ...current, [groupKey]: !current[groupKey] }));
  };

  const showCategory = (category) => {
    setSelectedCategory(category);
  };

  const visibleGroups = selectedCategory === 'admin' ? visibleAdminGroups : selectedCategory === 'hr' ? visibleHrGroups : visibleOperationGroups;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ minHeight: 72, px: drawerIsCollapsed ? 1.5 : 2.25, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            color: 'primary.contrastText',
            bgcolor: 'primary.main',
          }}
        >
          <PrecisionManufacturing />
        </Box>
        {!drawerIsCollapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={800} color="primary.main" noWrap>CMMS</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>Maintenance Control</Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ px: drawerIsCollapsed ? 1 : 1.5, pb: 1.5, display: 'flex', gap: 1 }}>
        {canShowOperation && (
          <CategoryButton
            selected={selectedCategory === 'operation'}
            label="Operation"
            collapsed={drawerIsCollapsed}
            onClick={() => showCategory('operation')}
          />
        )}
        {canShowHr && (
          <CategoryButton
            selected={selectedCategory === 'hr'}
            label="HR"
            collapsed={drawerIsCollapsed}
            onClick={() => showCategory('hr')}
          />
        )}
        {canShowAdmin && (
          <CategoryButton
            selected={selectedCategory === 'admin'}
            label="Admin"
            collapsed={drawerIsCollapsed}
            onClick={() => showCategory('admin')}
          />
        )}
      </Box>
      <Divider />
      <List sx={{ flex: 1, py: 1 }}>
        {selectedCategory === 'operation' && hasPermission('DASHBOARD_VIEW') && (
          <SidebarLink to="/dashboard" icon={<Dashboard />} label="Dashboard" collapsed={drawerIsCollapsed} onClick={closeMobile} />
        )}
        {visibleGroups.map((group) => {
          const activeGroup = group.paths.some((path) => location.pathname.startsWith(path));
          const groupButton = (
            <ListItemButton
              onClick={() => toggleGroup(group.key)}
              sx={(theme) => ({
                minHeight: 44,
                justifyContent: drawerIsCollapsed ? 'center' : 'flex-start',
                mx: 1,
                my: 0.25,
                px: drawerIsCollapsed ? 1.5 : 2,
                borderRadius: 1,
                color: activeGroup ? 'primary.main' : 'text.secondary',
                bgcolor: activeGroup ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08) : 'transparent',
              })}
            >
              <ListItemIcon sx={{ minWidth: drawerIsCollapsed ? 0 : 36, color: activeGroup ? 'primary.main' : 'text.secondary', justifyContent: 'center' }}>
                {group.icon}
              </ListItemIcon>
              {!drawerIsCollapsed && (
                <>
                  <ListItemText primary={group.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 800 }} />
                  {openGroups[group.key] ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>
          );

          return (
            <Box key={group.key}>
              {drawerIsCollapsed ? <Tooltip title={group.label} placement="right">{groupButton}</Tooltip> : groupButton}
              {!drawerIsCollapsed && (
                <Collapse in={openGroups[group.key]} timeout="auto" unmountOnExit>
                  {group.items.map((item) => (
                    <SidebarLink key={item.path} to={item.path} icon={item.icon} label={item.label} nested collapsed={false} onClick={closeMobile} />
                  ))}
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: drawerIsCollapsed ? 1 : 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
          <IconButton aria-label="Toggle theme" onClick={onToggleMode}>
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>
        {/*
                    secondary={`${notification.message}${notification.createdAt ? ` • ${new Date(notification.createdAt).toLocaleString()}` : ''}`}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: notification.status === 'UNREAD' ? 800 : 600 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                </ListItemButton>
              ))}
            </List>
            <Divider />
            <ButtonBase onClick={() => { closeNotifications(); navigate('/notifications'); }} sx={{ width: '100%', p: 1, borderRadius: 1, color: 'primary.main', fontSize: 14, fontWeight: 800 }}>
              View All
            </ButtonBase>
          </Box>
        </Popover>
        */}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box component="nav" sx={{ width: { md: currentDrawerWidth }, flexShrink: { md: 0 }, transition: theme.transitions.create('width') }}>
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop || mobileOpen}
          onClose={closeMobile}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: currentDrawerWidth,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.shortest,
              }),
              overflowX: 'hidden',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      {isDesktop && (
        <IconButton
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={toggleCollapsed}
          sx={{
            position: 'fixed',
            top: 18,
            left: currentDrawerWidth - 16,
            zIndex: theme.zIndex.drawer + 1,
            width: 32,
            height: 32,
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
        </IconButton>
      )}
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <TopNavbar onMenuClick={() => setMobileOpen(true)} />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default SidebarLayout;

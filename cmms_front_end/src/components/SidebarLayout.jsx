import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
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
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Assignment,
  Build,
  Business,
  ChevronLeft,
  ChevronRight,
  DarkMode,
  Dashboard,
  EventRepeat,
  ExpandLess,
  ExpandMore,
  History,
  LightMode,
  Logout,
  Menu,
  People,
  Place,
  PrecisionManufacturing,
  Timeline,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 280;
const collapsedWidth = 76;

const operationGroups = [
  {
    key: 'masters',
    label: 'Masters',
    icon: <Business />,
    paths: ['/equipment', '/vendors'],
    items: [
      { label: 'Equipment', path: '/equipment', icon: <PrecisionManufacturing /> },
      { label: 'Vendors', path: '/vendors', icon: <People /> },
    ],
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    icon: <Build />,
    paths: ['/maintenance'],
    items: [
      { label: 'Requests', path: '/maintenance/requests', icon: <Assignment /> },
      { label: 'Assignments', path: '/maintenance/assignments', icon: <Build /> },
      { label: 'Downtime', path: '/maintenance/downtime', icon: <Timeline /> },
      { label: 'Preventive Maintenance', path: '/maintenance/preventive', icon: <EventRepeat /> },
    ]
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <Timeline />,
    paths: ['/reports'],
    items: [
      { label: 'Equipment History', path: '/reports/equipment-history', icon: <History /> },
      { label: 'Downtime Analysis', path: '/reports/downtime-analysis', icon: <Timeline /> },
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
      { label: 'Sites', path: '/hr/sites', icon: <Place /> },
      { label: 'Employees', path: '/hr/employees', icon: <People /> },
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(() => localStorage.getItem('cmmsSidebarCollapsed') === 'true');
  const [selectedCategory, setSelectedCategory] = React.useState('operation');
  const [openGroups, setOpenGroups] = React.useState({
    masters: true,
    maintenance: true,
    reports: true,
    creation: true,
  });

  React.useEffect(() => {
    setSelectedCategory(location.pathname.startsWith('/hr') ? 'hr' : 'operation');
  }, [location.pathname]);

  React.useEffect(() => {
    const currentGroups = selectedCategory === 'hr' ? hrGroups : operationGroups;
    const activeGroup = currentGroups.find((group) => group.paths.some((path) => location.pathname.startsWith(path)));
    if (activeGroup) {
      setOpenGroups((current) => ({ ...current, [activeGroup.key]: true }));
    }
  }, [location.pathname, selectedCategory]);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  const visibleGroups = selectedCategory === 'hr' ? hrGroups : operationGroups;

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
        <CategoryButton
          selected={selectedCategory === 'operation'}
          label="Operation"
          collapsed={drawerIsCollapsed}
          onClick={() => showCategory('operation')}
        />
        <CategoryButton
          selected={selectedCategory === 'hr'}
          label="HR"
          collapsed={drawerIsCollapsed}
          onClick={() => showCategory('hr')}
        />
      </Box>
      <Divider />
      <List sx={{ flex: 1, py: 1 }}>
        {selectedCategory === 'operation' && (
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
        {!drawerIsCollapsed && (
          <>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 800 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={700} noWrap>{user?.firstName} {user?.lastName}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{user?.role}</Typography>
            </Box>
          </>
        )}
        <Tooltip title="Logout">
          <IconButton aria-label="Logout" onClick={handleLogout}><Logout /></IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" color="primary" sx={{ display: { md: 'none' } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} aria-label="Open sidebar">
            <Menu />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 800 }}>CMMS</Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton color="inherit" aria-label="Toggle theme" onClick={onToggleMode}>
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Toolbar>
      </AppBar>
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
      <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 3 }, pt: { xs: 9, md: 3 } }}>
        {children}
      </Box>
    </Box>
  );
}

export default SidebarLayout;

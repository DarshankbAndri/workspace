import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Box,
  ButtonBase,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import { Logout, Menu as MenuIcon, Notifications, PrecisionManufacturing } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import {
  getNotificationList,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotificationStream,
} from '../../features/notification/services/notificationService';
import { getCurrentCompany, resolveCompanyLogoUrl } from '../../features/company/services/companyService';

function TopNavbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [company, setCompany] = React.useState(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);
  const [profileAnchor, setProfileAnchor] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const loadNotifications = React.useCallback(() => {
    Promise.all([getNotificationList({ page: 0, size: 6 }), getUnreadNotificationCount()])
      .then(([items, count]) => {
        setNotifications((items || []).slice(0, 6));
        setUnreadCount(count || 0);
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      });
  }, []);

  React.useEffect(() => {
    getCurrentCompany().then(setCompany).catch(() => setCompany(null));
  }, []);

  React.useEffect(() => {
    loadNotifications();
    return subscribeToNotificationStream({
      onCreated: (notification) => {
        if (notification.status === 'ARCHIVED') {
          return;
        }
        setNotifications((current) => [notification, ...current.filter((item) => item.id !== notification.id)].slice(0, 6));
      },
      onUpdated: (notification) => {
        setNotifications((current) => {
          if (notification.status === 'ARCHIVED') {
            return current.filter((item) => item.id !== notification.id);
          }
          return current.map((item) => (item.id === notification.id ? notification : item));
        });
      },
      onCount: setUnreadCount,
    });
  }, [loadNotifications]);

  const openNotifications = (event) => {
    setNotificationAnchor(event.currentTarget);
    loadNotifications();
  };

  const closeNotifications = () => setNotificationAnchor(null);

  const openNotification = async (notification) => {
    if (notification.status === 'UNREAD') {
      await markNotificationRead(notification.id);
    }
    closeNotifications();
    loadNotifications();
    if (notification.targetUrl) {
      navigate(notification.targetUrl);
    }
  };

  const markNotificationsRead = async () => {
    await markAllNotificationsRead();
    loadNotifications();
  };

  const handleLogout = () => {
    setProfileAnchor(null);
    logout();
    navigate('/login');
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}` || user?.username?.[0] || 'U';
  const companyName = company?.companyName || 'CMMS';
  const logoUrl = resolveCompanyLogoUrl(company?.logoUrl);

  return (
    <Paper
      square
      elevation={0}
      sx={(theme) => ({
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.paper, 0.96),
        backdropFilter: 'blur(10px)',
      })}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ minHeight: 64, px: { xs: 1.5, md: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
          <IconButton aria-label="Open sidebar" onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              overflow: 'hidden',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              flex: '0 0 auto',
            }}
          >
            {logoUrl ? (
              <Box component="img" src={logoUrl} alt={companyName} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <PrecisionManufacturing />
            )}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={800} noWrap>{companyName}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>Maintenance Control</Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Tooltip title="Notifications">
            <IconButton aria-label="Notifications" onClick={openNotifications}>
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="User profile">
            <IconButton aria-label="User profile" onClick={(event) => setProfileAnchor(event.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 800 }}>
                {initials}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={closeNotifications}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: 360, maxWidth: '90vw', p: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 0.75 }}>
            <Typography variant="subtitle2" fontWeight={800}>Notifications</Typography>
            <ButtonBase onClick={markNotificationsRead} sx={{ px: 1, py: 0.5, borderRadius: 1, color: 'primary.main', fontSize: 13, fontWeight: 700 }}>
              Mark read
            </ButtonBase>
          </Stack>
          <Divider />
          <List dense sx={{ py: 0.5, maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No notifications.</Typography>
            )}
            {notifications.map((notification) => (
              <ListItemButton key={notification.id} onClick={() => openNotification(notification)} sx={{ alignItems: 'flex-start', borderRadius: 1 }}>
                <ListItemText
                  primary={notification.title}
                  secondary={`${notification.message}${notification.createdAt ? ` - ${new Date(notification.createdAt).toLocaleString()}` : ''}`}
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

      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleLogout}>
          <Logout fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </Paper>
  );
}

export default TopNavbar;

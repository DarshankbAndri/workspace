import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AccountCircle, LogoutOutlined, Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [navAnchorEl, setNavAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavMenuOpen = (event) => {
    setNavAnchorEl(event.currentTarget);
  };

  const handleNavMenuClose = () => {
    setNavAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
    handleNavMenuClose();
  };

  const navButtonStyles = {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'white',
    position: 'relative',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.15)',
      transform: 'translateY(-2px)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '0%',
      height: '2px',
      backgroundColor: '#ffc107',
      transition: 'width 0.3s ease',
    },
    '&:hover::after': {
      width: '100%',
    },
  };

  const createUserButtonStyles = {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#ffc107',
    backgroundColor: 'rgba(255,193,7,0.15)',
    padding: '6px 16px',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255,193,7,0.3)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(255,193,7,0.3)',
    },
  };

  // SVG Curved border between white and blue
  const CurvedBorder = () => (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      viewBox="0 0 1200 70"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Curved path from white to blue */}
      <path
        d="M 240,0 Q 260,35 240,70 L 0,70 L 0,0 Z"
        fill="white"
      />
    </svg>
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Navbar Container with split background */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          position: 'relative',
          height: { xs: 'auto', md: '70px' },
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          overflow: 'visible',
        }}
      >
        {/* White Section (20% with curved right edge) */}
        <Box
          sx={{
            width: { xs: '100%', md: '22%' },
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            padding: { xs: 2, md: '0 24px' },
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Company Logo and Branding */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
            onClick={() => navigate('/dashboard')}
          >
            <Box
              sx={{
                width: 45,
                height: 45,
                background: 'linear-gradient(135deg, #003da5 0%, #1565c0 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#ffc107',
                fontSize: '24px',
                boxShadow: '0 2px 8px rgba(0, 61, 165, 0.3)',
              }}
            >
              ✈
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: '#003da5',
                  lineHeight: 1,
                  fontSize: '18px',
                }}
              >
                Travel
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#1565c0',
                  fontWeight: 600,
                  fontSize: '11px',
                }}
              >
                Reimbursement
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Light Blue Section (78% - adjusted for curved border) */}
        <Box
          sx={{
            width: { xs: '100%', md: '78%' },
            background: 'linear-gradient(135deg, #1565c0 0%, #003da5 100%)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            padding: { xs: 2, md: 0 },
            gap: { xs: 1, md: 0 },
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Center Navigation Links */}
          <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {!isMobile ? (
              <>
                <Button
                  color="inherit"
                  sx={navButtonStyles}
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  sx={navButtonStyles}
                  onClick={() => navigate('/create-claim')}
                >
                  New Claim
                </Button>
                <Button
                  color="inherit"
                  sx={navButtonStyles}
                  onClick={() => navigate('/my-claims')}
                >
                  My Claims
                </Button>

                {user?.role === 'MANAGER' && (
                  <Button
                    color="inherit"
                    sx={navButtonStyles}
                    onClick={() => navigate('/approvals')}
                  >
                    Approvals
                  </Button>
                )}

                {user?.role === 'HR' && (
                  <>
                    <Button
                      color="inherit"
                      sx={navButtonStyles}
                      onClick={() => navigate('/payments')}
                    >
                      Payments
                    </Button>
                    <Button
                      color="inherit"
                      sx={createUserButtonStyles}
                      onClick={() => navigate('/create-user')}
                    >
                      ➕ Create User
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleNavMenuOpen}
                  sx={{ ml: 'auto' }}
                  aria-label="Open navigation menu"
                >
                  <MenuIcon sx={{ color: 'white' }} />
                </IconButton>
                <Menu
                  anchorEl={navAnchorEl}
                  open={Boolean(navAnchorEl)}
                  onClose={handleNavMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={() => handleNavigation('/dashboard')}>Dashboard</MenuItem>
                  <MenuItem onClick={() => handleNavigation('/create-claim')}>New Claim</MenuItem>
                  <MenuItem onClick={() => handleNavigation('/my-claims')}>My Claims</MenuItem>
                  {user?.role === 'MANAGER' && (
                    <MenuItem onClick={() => handleNavigation('/approvals')}>Approvals</MenuItem>
                  )}
                  {user?.role === 'HR' && (
                    <>
                      <MenuItem onClick={() => handleNavigation('/payments')}>Payments</MenuItem>
                      <MenuItem onClick={() => handleNavigation('/create-user')}>Create User</MenuItem>
                    </>
                  )}
                </Menu>
              </>
            )}
          </Box>

          {/* Right side - User menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto', mt: { xs: 1, md: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #ffc107 0%, #ffb300 100%)',
                  color: '#003da5',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
                onClick={handleMenuOpen}
              >
                {user?.firstName?.charAt(0)?.toUpperCase()}
                {user?.lastName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                >
                  {user?.role}
                </Typography>
              </Box>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  borderRadius: '8px',
                },
              }}
            >
              <MenuItem disabled>
                <AccountCircle sx={{ marginRight: 1, color: '#003da5' }} />
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {user?.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => handleNavigation('/change-password')}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 61, 165, 0.1)',
                  },
                }}
              >
                <Typography variant="caption" sx={{ color: '#003da5', fontWeight: 600 }}>
                  Change Password
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  },
                }}
              >
                <LogoutOutlined sx={{ marginRight: 1, color: '#f44336' }} />
                <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 600 }}>
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Navbar;

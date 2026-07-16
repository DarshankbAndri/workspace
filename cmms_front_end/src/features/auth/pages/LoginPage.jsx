import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import FactoryOutlinedIcon from '@mui/icons-material/FactoryOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import { useAuth } from '../../../shared/context/AuthContext';
import { login as apiLogin } from '../../../shared/services/api';
import { getFirstAllowedPath, getFirstAllowedPathFromAccess } from '../../../shared/utils/permissionRoutes';
import andritzLogo from '../assets/andritz-logo.png';

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, hasPermission } = useAuth();
  const [apiError, setApiError] = useState('');
  const [apiLoading, setApiLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  if (!loading && isAuthenticated) {
    return <Navigate to={getFirstAllowedPath(hasPermission)} replace />;
  }

  const onSubmit = async (data) => {
    setApiLoading(true);
    setApiError('');

    try {
      const response = await apiLogin(data.username, data.password);
      console.log('Login response:', response);

      if (!response || !response.data) {
        setApiError('Invalid response from server');
        return;
      }

      const { token, user, roles, permissions, allowedSites } = response.data;

      if (!token || !user) {
        setApiError('Token or user data missing from response');
        console.error('Missing token or user:', { token, user });
        return;
      }

      login(user, token, { roles, permissions, allowedSites });
      navigate(getFirstAllowedPathFromAccess({ user, roles, permissions }));
    } catch (err) {
      console.error('Login error:', err);

      if (err.response) {
        if (err.response.status === 401) {
          setApiError('Invalid username or password');
        } else if (err.response.status === 400) {
          setApiError('Invalid request format');
        } else {
          setApiError(`Login failed: ${err.response.status} - ${err.response.statusText}`);
        }
        console.error('Response error:', err.response.data);
      } else if (err.request) {
        setApiError('No response from server. Check if backend is running.');
        console.error('Request error:', err.request);
      } else {
        setApiError(`Error: ${err.message}`);
      }
    } finally {
      setApiLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(onSubmit)();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(420px, 0.92fr) minmax(460px, 1.08fr)' },
        background: 'linear-gradient(135deg, #eef4f8 0%, #f8fafc 42%, #edf1e9 100%)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: { xs: 'none', md: 'flex' },
          minHeight: '100vh',
          overflow: 'hidden',
          color: '#ffffff',
          background: 'linear-gradient(150deg, #06294a 0%, #0b5788 54%, #d8a51d 100%)',
          px: { md: 6, lg: 9 },
          py: 7,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            opacity: 0.42,
          }}
        />
        <Stack sx={{ position: 'relative', zIndex: 1, width: '100%' }} justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 8 }}>
              <Box
                component="img"
                src={andritzLogo}
                alt="ANDRITZ logo"
                sx={{
                  width: 58,
                  height: 44,
                  objectFit: 'contain',
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: '#ffffff',
                }}
              />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 22, lineHeight: 1 }}>
                  ANDRITZ
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.74)', fontSize: 13 }}>
                  Enterprise Maintenance Platform
                </Typography>
              </Box>
            </Stack>

            <Typography
              component="h1"
              sx={{
                maxWidth: 560,
                fontSize: { md: 44, lg: 54 },
                fontWeight: 800,
                lineHeight: 1.05,
                mb: 3,
              }}
            >
              ANDRITZ CMMS ERP
            </Typography>
            <Typography sx={{ maxWidth: 500, color: 'rgba(255,255,255,0.82)', fontSize: 18, lineHeight: 1.7 }}>
              Secure access for maintenance, assets, work orders, approvals, and inventory operations.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2.5} sx={{ pb: 2 }}>
            {[
              { icon: <FactoryOutlinedIcon />, label: 'Plants' },
              { icon: <WorkspacesOutlinedIcon />, label: 'Workflow' },
              { icon: <ShieldOutlinedIcon />, label: 'Access' },
            ].map((item) => (
              <Stack
                key={item.label}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  px: 1.5,
                  py: 1,
                  border: '1px solid rgba(255,255,255,0.24)',
                  borderRadius: 1,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {item.icon}
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{item.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 4, lg: 8 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 480,
            p: { xs: 3, sm: 4.5 },
            borderRadius: 2,
            border: '1px solid rgba(15, 23, 42, 0.1)',
            boxShadow: '0 24px 70px rgba(15, 23, 42, 0.14)',
          }}
        >
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  component="img"
                  src={andritzLogo}
                  alt="ANDRITZ logo"
                  sx={{
                    width: 48,
                    height: 38,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid #e2e8f0',
                    p: 0.75,
                    backgroundColor: '#ffffff',
                  }}
                />
                <Box>
                  <Typography sx={{ color: '#003da5', fontWeight: 900, fontSize: 18, lineHeight: 1 }}>
                    ANDRITZ
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 0.5 }}>
                    Developed by ANDRITZ
                  </Typography>
                </Box>
              </Stack>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 1,
                  color: '#755500',
                  backgroundColor: '#fff4cc',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                ERP
              </Box>
            </Stack>

            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
                Welcome back
              </Typography>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                Sign in to continue to the ANDRITZ CMMS ERP workspace.
              </Typography>
            </Box>

            {apiError && <Alert severity="error">{apiError}</Alert>}

            <Box component="form" onSubmit={handleFormSubmit} noValidate>
              <Stack spacing={2.25}>
                <TextField
                  fullWidth
                  label="Username"
                  autoComplete="username"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters',
                    },
                  })}
                  variant="outlined"
                  disabled={apiLoading}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  variant="outlined"
                  disabled={apiLoading}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  startIcon={apiLoading ? null : <LoginOutlinedIcon />}
                  sx={{
                    mt: 1,
                    minHeight: 52,
                    backgroundColor: '#003da5',
                    boxShadow: '0 14px 28px rgba(0, 61, 165, 0.24)',
                    '&:hover': {
                      backgroundColor: '#002c7a',
                      boxShadow: '0 16px 32px rgba(0, 61, 165, 0.28)',
                    },
                  }}
                  disabled={apiLoading}
                >
                  {apiLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign in'}
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="space-between"
              sx={{ color: 'text.secondary' }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <ShieldOutlinedIcon sx={{ color: '#2e7d32', fontSize: 18 }} />
                <Typography sx={{ fontSize: 13 }}>Secured ERP access</Typography>
              </Stack>
              <Typography sx={{ fontSize: 13 }}>
                CMMS application developed by ANDRITZ
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginPage;

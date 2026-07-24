import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  BadgeOutlined as BadgeOutlinedIcon,
  LockOutlined as LockOutlinedIcon,
  LoginOutlined as LoginOutlinedIcon,
  ShieldOutlined as ShieldOutlinedIcon,
  VisibilityOffOutlined as VisibilityOffOutlinedIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../shared/context/AuthContext';
import { login as apiLogin } from '../../../shared/services/api';
import { getFirstAllowedPath, getFirstAllowedPathFromAccess } from '../../../shared/utils/permissionRoutes';
import andritzLogo from '../assets/andritz-logo.png';
import loginBackground from '../assets/login-background.png';

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, hasPermission } = useAuth();
  const [apiError, setApiError] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      if (!response || !response.data) {
        setApiError('Invalid response from server');
        return;
      }

      const { token, user, roles, permissions, allowedSites } = response.data;

      if (!token || !user) {
        setApiError('Token or user data missing from response');
        return;
      }

      login(user, token, { roles, permissions, allowedSites });
      navigate(getFirstAllowedPathFromAccess({ user, roles, permissions }));
    } catch (err) {
      const error = err.apiError || err.response?.data;
      if (error) {
        if (error.status === 401 || error.code === 'INVALID_CREDENTIALS') {
          setApiError('Invalid username or password');
        } else if (error.message) {
          setApiError(error.message);
        } else {
          setApiError('Unable to sign in. Please try again.');
        }
      } else if (err.request) {
        setApiError('No response from server. Check if backend is running.');
      } else {
        setApiError(err.message || 'Unable to sign in. Please try again.');
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
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 5 },
        backgroundImage: `linear-gradient(90deg, rgba(3, 18, 38, 0.84), rgba(5, 24, 52, 0.62)), url(${loginBackground})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.18), transparent 28%), linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.34))',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backdropFilter: 'saturate(108%)',
          pointerEvents: 'none',
        },
      }}
      >
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 460,
            p: { xs: 2.5, sm: 4 },
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.34)',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            boxShadow: '0 28px 90px rgba(0, 0, 0, 0.36)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <Stack spacing={2.75}>
            <Stack alignItems="center" spacing={1.35} sx={{ textAlign: 'center' }}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.35}>
                <Box
                  component="img"
                  src={andritzLogo}
                  alt="ANDRITZ logo"
                  sx={{
                    width: 48,
                    height: 38,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid rgba(0, 61, 165, 0.14)',
                    p: 0.75,
                    backgroundColor: '#ffffff',
                  }}
                />
                <Box>
                  <Typography sx={{ color: 'primary.main', fontWeight: 900, fontSize: 18, lineHeight: 1 }}>
                    ANDRITZ
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
                Welcome back
              </Typography>
              <Typography sx={{ color: 'text.secondary', lineHeight: 1.6, maxWidth: 330 }}>
                Sign in to access CMMS maintenance, inventory, approvals, and asset workflows.
              </Typography>
            </Stack>

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
                  type={showPassword ? 'text' : 'password'}
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
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          edge="end"
                          disabled={apiLoading}
                          onClick={() => setShowPassword((current) => !current)}
                        >
                          {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                        </IconButton>
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
                    boxShadow: '0 14px 28px rgba(0, 61, 165, 0.24)',
                    '&:hover': {
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
              <Typography sx={{ fontSize: 13, textAlign: { xs: 'left', sm: 'right' } }}>
                Developed by ANDRITZ
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Box>
  );
}

export default LoginPage;

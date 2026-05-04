import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin } from '../services/api';

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
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
    return <Navigate to="/dashboard" replace />;
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
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        setApiError('Token or user data missing from response');
        console.error('Missing token or user:', { token, user });
        return;
      }
      
      // Store token and user data in AuthContext and localStorage
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setApiError('Invalid username or password');
        } else if (err.response.status === 400) {
          setApiError('Invalid request format');
        } else {
          setApiError(`Login failed: ${err.response.status} - ${err.response.statusText}`);
        }
        console.error('Response error:', err.response.data);
      } else if (err.request) {
        // Request made but no response
        setApiError('No response from server. Check if backend is running.');
        console.error('Request error:', err.request);
      } else {
        // Other errors
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #003da5 0%, #1565c0 100%)',
        padding: { xs: 2, sm: 4 },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          sx={{
            padding: { xs: 3, sm: 4 },
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                backgroundColor: '#ffc107',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#003da5',
                fontSize: '32px',
                margin: '0 auto 16px',
              }}
            >
              A
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
              ANDRITZ Travel
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Employee Reimbursement System
            </Typography>
          </Box>

          {apiError && <Alert severity="error" sx={{ marginBottom: 2 }}>{apiError}</Alert>}

          {/* Login Form */}
          <form onSubmit={handleFormSubmit} noValidate>
            {/* Username Field */}
            <TextField
              fullWidth
              label="Username"
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters',
                },
              })}
              margin="normal"
              variant="outlined"
              disabled={apiLoading}
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              margin="normal"
              variant="outlined"
              disabled={apiLoading}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            {/* Login Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              sx={{
                marginTop: 3,
                backgroundColor: '#003da5',
                '&:hover': {
                  backgroundColor: '#002c7a',
                },
                position: 'relative',
              }}
              disabled={apiLoading}
            >
              {apiLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Login'}
            </Button>
          </form>

          {/* Info Box */}
          <Box
            sx={{
              marginTop: 3,
              padding: 2,
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              <strong>Default Password:</strong> andritz
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', marginTop: 1 }}>
              <strong>Demo Users:</strong> alice, bob, charlie
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;

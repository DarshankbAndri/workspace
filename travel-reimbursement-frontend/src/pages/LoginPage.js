import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiLogin(username, password);
      const { token, user } = response.data;
      
      // Store token and user data in AuthContext and localStorage
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #003da5 0%, #1565c0 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          sx={{
            padding: 4,
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

          {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}

          {/* Form Fields */}
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            variant="outlined"
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
            disabled={loading}
            onKeyPress={handleKeyPress}
          />

          {/* Login Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{
              marginTop: 3,
              backgroundColor: '#003da5',
              '&:hover': {
                backgroundColor: '#002c7a',
              },
              position: 'relative',
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Login'}
          </Button>

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

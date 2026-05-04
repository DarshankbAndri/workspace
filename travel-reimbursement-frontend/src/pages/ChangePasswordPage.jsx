import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { changePassword as apiChangePassword } from '../services/api';
import Navbar from '../components/Navbar';

function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.currentPassword) {
      setError('Current password is required');
      return;
    }
    if (!formData.newPassword) {
      setError('New password is required');
      return;
    }
    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await apiChangePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      setSuccess('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Current password is incorrect');
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: 'calc(100vh - 70px)',
          backgroundColor: '#f5f5f5',
          padding: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 2 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: '#003da5',
                marginBottom: 1,
                textAlign: 'center',
              }}
            >
              Change Password
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                marginBottom: 3,
                textAlign: 'center',
              }}
            >
              Update your password for {user?.firstName} {user?.lastName}
            </Typography>

            {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ marginBottom: 2 }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                disabled={loading}
              />

              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                disabled={loading}
              />

              <Box sx={{ display: 'flex', gap: 2, marginTop: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  sx={{
                    backgroundColor: '#003da5',
                    '&:hover': {
                      backgroundColor: '#002c7a',
                    },
                  }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Change Password'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </form>

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
                <strong>Password Requirements:</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', marginTop: 0.5 }}>
                • At least 6 characters long
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}

export default ChangePasswordPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { createUserByHR } from '../../../shared/services/api';
import { getFirstAllowedPath } from '../../../shared/utils/permissionRoutes';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { PersonAdd, ArrowBack } from '@mui/icons-material';

function UserManagementPage() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const firstAllowedPath = getFirstAllowedPath(hasPermission);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'EMPLOYEE',
    department: '',
    managerId: '',
  });

  // Check if user has HR role
  if (!user || user.role !== 'HR') {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Only HR personnel can access this page.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(firstAllowedPath)}
            startIcon={<ArrowBack />}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }
    if (!formData.department.trim()) {
      setError('Department is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const userPayload = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        department: formData.department,
        managerId: formData.managerId ? parseInt(formData.managerId) : null,
      };

      const response = await createUserByHR(user.id, userPayload);
      setSuccess(`User "${response.data.username}" created successfully!`);
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'EMPLOYEE',
        department: '',
        managerId: '',
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate(firstAllowedPath);
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create user';
      setError(errorMessage);
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Header Card */}
        <Grid item xs={12}>
          <Card sx={{ background: 'linear-gradient(135deg, #003da5 0%, #1565c0 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonAdd sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Create New User
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    HR Only - Add a new employee to the system
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Form Card */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Username */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="e.g., john.doe"
                    disabled={loading}
                    required
                    variant="outlined"
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g., john.doe@company.com"
                    disabled={loading}
                    required
                    variant="outlined"
                  />
                </Grid>

                {/* First Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g., John"
                    disabled={loading}
                    required
                    variant="outlined"
                  />
                </Grid>

                {/* Last Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g., Doe"
                    disabled={loading}
                    required
                    variant="outlined"
                  />
                </Grid>

                {/* Department */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g., IT, HR, Finance"
                    disabled={loading}
                    required
                    variant="outlined"
                  />
                </Grid>

                {/* Role */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={loading}
                      label="Role"
                    >
                      <MenuItem value="EMPLOYEE">Employee</MenuItem>
                      <MenuItem value="MANAGER">Manager</MenuItem>
                      <MenuItem value="HR">HR</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Manager ID (Optional) */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Manager ID (Optional)"
                    name="managerId"
                    type="number"
                    value={formData.managerId}
                    onChange={handleInputChange}
                    placeholder="Enter manager's user ID if applicable"
                    disabled={loading}
                    variant="outlined"
                    helperText="Leave empty if no manager is assigned"
                  />
                </Grid>

                {/* Buttons */}
                <Grid item xs={12} sx={{ display: 'flex', gap: 2, pt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    sx={{ flex: 1 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Create User'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => navigate(firstAllowedPath)}
                    disabled={loading}
                    startIcon={<ArrowBack />}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Info Card */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                📋 User Creation Guidelines
              </Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Username must be unique and cannot be changed</li>
                <li>Email address must be valid and unique</li>
                <li>Role determines user permissions in the system</li>
                <li>Manager ID is optional and can be assigned later</li>
                <li>All fields except Manager ID are required</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default UserManagementPage;

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
  Grid,
} from '@mui/material';
import { createClaim, submitClaim } from '../services/api';
import { useAuth } from '../context/AuthContext';

function CreateClaimPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const claimPayload = {
        description: formData.description,
        amount: parseFloat(formData.amount),
      };

      // Create the claim
      const response = await createClaim(user.userId, claimPayload);
      const claimId = response.data.id;

      // Submit the claim for approval
      await submitClaim(claimId, user.userId);

      setSuccess(true);
      setFormData({ description: '', amount: '' });

      // Redirect to my claims after 2 seconds
      setTimeout(() => {
        navigate('/my-claims');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create claim. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingY: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ padding: 4, borderRadius: 2 }}>
          {/* Header */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
              Create New Claim
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Submit a new travel expense reimbursement claim
            </Typography>
          </Box>

          {success && (
            <Alert
              severity="success"
              sx={{ marginBottom: 3 }}
              onClose={() => setSuccess(false)}
            >
              ✅ Claim submitted successfully! Redirecting...
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{ marginBottom: 3 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Describe your travel expense (e.g., Business trip to New York for client meeting)"
                  variant="outlined"
                  disabled={loading}
                />
              </Grid>

              {/* Amount */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  inputProps={{ step: '0.01', min: '0' }}
                  variant="outlined"
                  disabled={loading}
                  InputProps={{
                    startAdornment: '$',
                  }}
                />
              </Grid>

              {/* Amount Summary */}
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    padding: 2,
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Amount to be reimbursed:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', marginTop: 0.5 }}>
                    ${formData.amount || '0.00'}
                  </Typography>
                </Paper>
              </Grid>

              {/* Form Info */}
              <Grid item xs={12}>
                <Paper
                  sx={{
                    padding: 2,
                    backgroundColor: '#e8f5e9',
                    border: '1px solid #81c784',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#2e7d32' }}>
                    <strong>📋 Note:</strong> Your claim will be submitted for manager approval after creation. Your manager will review and approve or reject your claim.
                  </Typography>
                </Paper>
              </Grid>

              {/* Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ flex: 1 }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ marginRight: 1 }} />
                        Submitting...
                      </>
                    ) : (
                      'Submit Claim'
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default CreateClaimPage;

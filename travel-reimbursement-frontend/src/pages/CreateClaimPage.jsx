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
  Grid,
  IconButton,
  Divider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { createClaim } from '../services/api';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const createLineItem = () => ({ id: `${Date.now()}-${Math.random()}`, description: '', amount: '', days: '' });

const sectionDefinitions = [
  { key: 'dailySummary', title: 'Daily Summary' },
  { key: 'hotel', title: 'Hotel' },
  { key: 'telephone', title: 'Telephone Calls / Internet' },
  { key: 'taxi', title: 'Taxi' },
  { key: 'miscellaneous', title: 'Miscellaneous' },
  { key: 'otherExpenses', title: 'Other Trip Expenses' },
];

function CreateClaimPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [basicDetails, setBasicDetails] = useState({
    projectName: '',
    travelPurpose: '',
    travelFromDate: '',
    travelFromTime: '',
    travelToDate: '',
    travelToTime: '',
    fromLocation: '',
    toLocation: '',
  });

  const [sections, setSections] = useState({
    dailySummary: [createLineItem()],
    hotel: [createLineItem()],
    telephone: [createLineItem()],
    taxi: [createLineItem()],
    miscellaneous: [createLineItem()],
    otherExpenses: [createLineItem()],
  });

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (section, index, field, value) => {
    setSections((prev) => {
      const updatedItems = [...prev[section]];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, [section]: updatedItems };
    });
  };

  const addSectionItem = (section) => {
    setSections((prev) => ({
      ...prev,
      [section]: [...prev[section], createLineItem()],
    }));
  };

  const removeSectionItem = (section, index) => {
    setSections((prev) => {
      const updatedItems = [...prev[section]];
      updatedItems.splice(index, 1);
      return {
        ...prev,
        [section]: updatedItems.length > 0 ? updatedItems : [createLineItem()],
      };
    });
  };

  const formatCurrency = (value) => {
    const amount = parseFloat(value);
    return Number.isNaN(amount) ? '0.00' : amount.toFixed(2);
  };

  const getLineTotal = (item) => {
    const amount = parseFloat(item.amount) || 0;
    const days = parseInt(item.days, 10) || 0;
    return (amount * days).toFixed(2);
  };

  const computeTotalAmount = () => {
    return Object.values(sections).reduce((total, sectionItems) => {
      return total + sectionItems.reduce((sectionSum, item) => {
        const amount = parseFloat(item.amount) || 0;
        const days = parseInt(item.days, 10) || 0;
        return sectionSum + amount * days;
      }, 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!basicDetails.projectName.trim()) {
      setError('Project name is required.');
      return;
    }

    if (!basicDetails.fromLocation.trim() || !basicDetails.toLocation.trim()) {
      setError('Travel origin and destination are required.');
      return;
    }

    if (!user?.id) {
      setError('User authentication data is missing. Please log in again.');
      return;
    }

    const totalAmount = computeTotalAmount();
    if (totalAmount <= 0) {
      setError('Please add at least one expense entry with amount and days.');
      return;
    }

    const claimPayload = {
      projectName: basicDetails.projectName,
      travelPurpose: basicDetails.travelPurpose,
      travelFromDate: basicDetails.travelFromDate,
      travelFromTime: basicDetails.travelFromTime,
      travelToDate: basicDetails.travelToDate,
      travelToTime: basicDetails.travelToTime,
      fromLocation: basicDetails.fromLocation,
      toLocation: basicDetails.toLocation,
      description: basicDetails.travelPurpose || basicDetails.projectName || 'Travel claim',
      amount: totalAmount.toFixed(2),
      dailySummary: sections.dailySummary.map((item) => ({
        description: item.description,
        amount: item.amount ? parseFloat(item.amount) : null,
        days: item.days ? parseInt(item.days, 10) : null,
        total: parseFloat(getLineTotal(item)),
      })),
      hotel: sections.hotel.map((item) => ({
        description: item.description,
        amount: item.amount ? parseFloat(item.amount) : null,
        days: item.days ? parseInt(item.days, 10) : null,
        total: parseFloat(getLineTotal(item)),
      })),
      telephone: sections.telephone.map((item) => ({
        description: item.description,
        amount: item.amount ? parseFloat(item.amount) : null,
        days: item.days ? parseInt(item.days, 10) : null,
        total: parseFloat(getLineTotal(item)),
      })),
      taxi: sections.taxi.map((item) => ({
        description: item.description,
        amount: item.amount ? parseFloat(item.amount) : null,
        days: item.days ? parseInt(item.days, 10) : null,
        total: parseFloat(getLineTotal(item)),
      })),
      miscellaneous: sections.miscellaneous.map((item) => ({
        description: item.description,
        amount: item.amount ? parseFloat(item.amount) : null,
        days: item.days ? parseInt(item.days, 10) : null,
        total: parseFloat(getLineTotal(item)),
      })),
      otherExpenses: sections.otherExpenses.map((item) => ({
        description: item.description,
        amount: item.amount ? parseFloat(item.amount) : null,
        days: item.days ? parseInt(item.days, 10) : null,
        total: parseFloat(getLineTotal(item)),
      })),
    };

    setLoading(true);
    try {
      await createClaim(user.id, claimPayload);
      setSuccess(true);
      setError('');
    } catch (err) {
      setError('Failed to save claim. Please try again.');
      console.error('Create claim error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Create New Travel Claim
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Enter travel details and add expense entries for each category.
            </Typography>
          </Box>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
              ✅ Claim form updated locally. Backend integration will be added later.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                1. Trip Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Project Name"
                    name="projectName"
                    value={basicDetails.projectName}
                    onChange={handleBasicChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Travel Purpose"
                    name="travelPurpose"
                    value={basicDetails.travelPurpose || ''}
                    onChange={handleBasicChange}
                    disabled={loading}
                    placeholder="Optional"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="From Date"
                    name="travelFromDate"
                    type="date"
                    value={basicDetails.travelFromDate}
                    onChange={handleBasicChange}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="From Time"
                    name="travelFromTime"
                    type="time"
                    value={basicDetails.travelFromTime}
                    onChange={handleBasicChange}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="To Date"
                    name="travelToDate"
                    type="date"
                    value={basicDetails.travelToDate}
                    onChange={handleBasicChange}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="To Time"
                    name="travelToTime"
                    type="time"
                    value={basicDetails.travelToTime}
                    onChange={handleBasicChange}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="From Location"
                    name="fromLocation"
                    value={basicDetails.fromLocation}
                    onChange={handleBasicChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="To Location"
                    name="toLocation"
                    value={basicDetails.toLocation}
                    onChange={handleBasicChange}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </Paper>

            {sectionDefinitions.map((section) => (
              <Paper key={section.key} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{section.title}</Typography>
                  <Button
                    size="small"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => addSectionItem(section.key)}
                    disabled={loading}
                  >
                    Add entry
                  </Button>
                </Box>

                {sections[section.key].map((item, index) => (
                  <Box key={item.id} sx={{ mb: 2, pb: 2, borderBottom: index !== sections[section.key].length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={item.description}
                          onChange={(e) => handleSectionChange(section.key, index, 'description', e.target.value)}
                          disabled={loading}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Amount"
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleSectionChange(section.key, index, 'amount', e.target.value)}
                          inputProps={{ step: '0.01', min: '0' }}
                          disabled={loading}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="No. Days"
                          type="number"
                          value={item.days}
                          onChange={(e) => handleSectionChange(section.key, index, 'days', e.target.value)}
                          inputProps={{ step: '1', min: '0' }}
                          disabled={loading}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Total"
                          value={`$${getLineTotal(item)}`}
                          InputProps={{ readOnly: true }}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <IconButton
                          color="error"
                          onClick={() => removeSectionItem(section.key, index)}
                          disabled={loading}
                          aria-label="Remove entry"
                        >
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Paper>
            ))}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? 'Saving...' : 'Save Claim UI'}
              </Button>
              <Button variant="outlined" size="large" onClick={() => navigate('/dashboard')} disabled={loading}>
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default CreateClaimPage;

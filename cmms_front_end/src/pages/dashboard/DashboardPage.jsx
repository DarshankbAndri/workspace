import React from 'react';
import { Box, Grid, Paper, Typography, Alert, CircularProgress } from '@mui/material';
import { Build, Business, PrecisionManufacturing, Timeline } from '@mui/icons-material';
import { getDashboardSummary } from '../../services/maintenanceService';

const cards = [
  { key: 'totalEquipments', label: 'Total Equipments', icon: <PrecisionManufacturing />, color: '#003da5' },
  { key: 'activeVendors', label: 'Active Vendors', icon: <Business />, color: '#2e7d32' },
  { key: 'openRequests', label: 'Open Requests', icon: <Build />, color: '#ed6c02' },
  { key: 'totalDowntimeHours', label: 'Downtime Hours', icon: <Timeline />, color: '#9c27b0' },
];

function DashboardPage() {
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch(() => setError('Unable to load dashboard metrics.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Live maintenance overview for equipment, vendors, requests, and downtime.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} lg={3} key={card.key}>
              <Paper sx={{ p: 2.5, borderRadius: 1, border: '1px solid #e6e8ef' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                      {summary?.[card.key] ?? 0}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color, display: 'flex' }}>{card.icon}</Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default DashboardPage;

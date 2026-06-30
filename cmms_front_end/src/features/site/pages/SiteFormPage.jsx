import React from 'react';
import { Alert, Box, Button, Grid, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createSite, getSiteById, updateSite } from '../services/siteService';

const initialForm = {
  siteCode: '',
  siteName: '',
  organizationName: '',
  siteType: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  contactPerson: '',
  contactMobile: '',
  contactEmail: '',
  latitude: '',
  longitude: '',
  status: 'ACTIVE',
};

function SiteFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const viewOnly = Boolean(location.state?.viewOnly) || location.pathname.endsWith('/view');
  const [form, setForm] = React.useState(initialForm);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState('');

  React.useEffect(() => {
    if (isEdit) {
      getSiteById(id).then((data) => setForm({ ...initialForm, ...data })).catch(() => setError('Unable to load site.'));
    }
  }, [id, isEdit]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
      };
      if (isEdit) {
        await updateSite(id, payload);
      } else {
        await createSite(payload);
      }
      setSnackbar('Site saved.');
      navigate('/hr/sites');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save site.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>{viewOnly ? 'View Site' : isEdit ? 'Edit Site' : 'Add Site'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><TextField required disabled={viewOnly} fullWidth label="Site Code" value={form.siteCode} onChange={updateField('siteCode')} /></Grid>
          <Grid item xs={12} md={8}><TextField required disabled={viewOnly} fullWidth label="Site Name" value={form.siteName} onChange={updateField('siteName')} /></Grid>
          <Grid item xs={12} md={6}><TextField disabled={viewOnly} fullWidth label="Organization Name" value={form.organizationName || ''} onChange={updateField('organizationName')} /></Grid>
          <Grid item xs={12} md={3}><TextField disabled={viewOnly} fullWidth label="Site Type" value={form.siteType || ''} onChange={updateField('siteType')} /></Grid>
          <Grid item xs={12} md={3}><TextField select disabled={viewOnly} fullWidth label="Status" value={form.status || 'ACTIVE'} onChange={updateField('status')}><MenuItem value="ACTIVE">ACTIVE</MenuItem><MenuItem value="INACTIVE">INACTIVE</MenuItem></TextField></Grid>
          <Grid item xs={12} md={6}><TextField disabled={viewOnly} fullWidth label="Address Line 1" value={form.addressLine1 || ''} onChange={updateField('addressLine1')} /></Grid>
          <Grid item xs={12} md={6}><TextField disabled={viewOnly} fullWidth label="Address Line 2" value={form.addressLine2 || ''} onChange={updateField('addressLine2')} /></Grid>
          <Grid item xs={12} md={3}><TextField disabled={viewOnly} fullWidth label="City" value={form.city || ''} onChange={updateField('city')} /></Grid>
          <Grid item xs={12} md={3}><TextField disabled={viewOnly} fullWidth label="State" value={form.state || ''} onChange={updateField('state')} /></Grid>
          <Grid item xs={12} md={3}><TextField disabled={viewOnly} fullWidth label="Country" value={form.country || ''} onChange={updateField('country')} /></Grid>
          <Grid item xs={12} md={3}><TextField disabled={viewOnly} fullWidth label="Pincode" value={form.pincode || ''} onChange={updateField('pincode')} /></Grid>
          <Grid item xs={12} md={4}><TextField disabled={viewOnly} fullWidth label="Contact Person" value={form.contactPerson || ''} onChange={updateField('contactPerson')} /></Grid>
          <Grid item xs={12} md={4}><TextField disabled={viewOnly} fullWidth label="Contact Mobile" value={form.contactMobile || ''} onChange={updateField('contactMobile')} /></Grid>
          <Grid item xs={12} md={4}><TextField type="email" disabled={viewOnly} fullWidth label="Contact Email" value={form.contactEmail || ''} onChange={updateField('contactEmail')} /></Grid>
          <Grid item xs={12} md={3}><TextField type="number" disabled={viewOnly} fullWidth label="Latitude" value={form.latitude || ''} onChange={updateField('latitude')} /></Grid>
          <Grid item xs={12} md={3}><TextField type="number" disabled={viewOnly} fullWidth label="Longitude" value={form.longitude || ''} onChange={updateField('longitude')} /></Grid>
        </Grid>
        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          {!viewOnly && <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>}
          <Button variant="outlined" onClick={() => navigate('/hr/sites')}>{viewOnly ? 'Back' : 'Cancel'}</Button>
        </Stack>
      </Paper>
      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} message={snackbar} onClose={() => setSnackbar('')} />
    </Box>
  );
}

export default SiteFormPage;

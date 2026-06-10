import React from 'react';
import { Alert, Box, Button, FormControlLabel, Grid, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { createVendor, getVendorById, updateVendor } from '../../services/vendorService';

const initialForm = {
  vendorCode: '',
  vendorName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  serviceCategory: '',
  active: true,
};

function VendorFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = React.useState(initialForm);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (isEdit) {
      getVendorById(id).then((data) => setForm({ ...initialForm, ...data })).catch(() => setError('Unable to load vendor.'));
    }
  }, [id, isEdit]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateActive = (event) => setForm((current) => ({ ...current, active: event.target.checked }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await updateVendor(id, form);
      } else {
        await createVendor(form);
      }
      navigate('/vendors');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save vendor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>{isEdit ? 'Edit Vendor' : 'Add Vendor'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><TextField required fullWidth label="Vendor Code" value={form.vendorCode} onChange={updateField('vendorCode')} /></Grid>
          <Grid item xs={12} md={8}><TextField required fullWidth label="Vendor Name" value={form.vendorName} onChange={updateField('vendorName')} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Contact Person" value={form.contactPerson || ''} onChange={updateField('contactPerson')} /></Grid>
          <Grid item xs={12} md={4}><TextField type="email" fullWidth label="Email" value={form.email || ''} onChange={updateField('email')} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Phone" value={form.phone || ''} onChange={updateField('phone')} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Service Category" value={form.serviceCategory || ''} onChange={updateField('serviceCategory')} /></Grid>
          <Grid item xs={12} md={6}><FormControlLabel control={<Switch checked={Boolean(form.active)} onChange={updateActive} />} label="Active vendor" /></Grid>
          <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="Address" value={form.address || ''} onChange={updateField('address')} /></Grid>
        </Grid>
        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          <Button variant="outlined" onClick={() => navigate('/vendors')}>Cancel</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default VendorFormPage;

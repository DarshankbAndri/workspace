import React from 'react';
import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createSparePart, getSparePartById, updateSparePart } from '../../services/sparePartService';
import { getSites } from '../../services/siteService';
import { getVendorsBySite } from '../../services/vendorService';

const initialForm = {
  partCode: '',
  partName: '',
  description: '',
  category: '',
  unit: 'PCS',
  preferredVendorId: '',
  siteId: '',
  currentStock: 0,
  minimumStock: 0,
  unitCost: 0,
  storageLocation: '',
  status: 'ACTIVE',
};

function SparePartFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && !location.pathname.endsWith('/view');
  const isView = location.pathname.endsWith('/view');
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getSites()
      .then((data) => setSites((data || []).filter((site) => site.status !== 'INACTIVE')))
      .catch(() => setError('Unable to load sites.'));
  }, []);

  React.useEffect(() => {
    if (id) {
      getSparePartById(id)
        .then((data) => setForm({
          ...initialForm,
          ...data,
          preferredVendorId: data.preferredVendorId || '',
          siteId: data.siteId || '',
          currentStock: data.currentStock ?? 0,
          minimumStock: data.minimumStock ?? 0,
          unitCost: data.unitCost ?? 0,
        }))
        .catch((err) => setError(err.response?.data?.message || 'Unable to load spare part.'));
    }
  }, [id]);

  React.useEffect(() => {
    if (!form.siteId) {
      setVendors([]);
      return;
    }
    getVendorsBySite(form.siteId)
      .then((data) => setVendors(data || []))
      .catch(() => setError('Unable to load vendors for selected site.'));
  }, [form.siteId]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSite = (event) => setForm((current) => ({ ...current, siteId: event.target.value, preferredVendorId: '' }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        siteId: Number(form.siteId),
        preferredVendorId: form.preferredVendorId ? Number(form.preferredVendorId) : null,
        currentStock: Number(form.currentStock || 0),
        minimumStock: Number(form.minimumStock || 0),
        unitCost: Number(form.unitCost || 0),
      };
      if (isEdit) {
        await updateSparePart(id, payload);
      } else {
        await createSparePart(payload);
      }
      navigate('/inventory/spare-parts');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save spare part.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>{isView ? 'View Spare Part' : isEdit ? 'Edit Spare Part' : 'Add Spare Part'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><TextField required fullWidth disabled={isView || isEdit} label="Part Code" value={form.partCode || ''} onChange={updateField('partCode')} /></Grid>
          <Grid item xs={12} md={4}><TextField required fullWidth disabled={isView} label="Part Name" value={form.partName || ''} onChange={updateField('partName')} /></Grid>
          <Grid item xs={12} md={4}><TextField required fullWidth disabled={isView} label="Unit" value={form.unit || ''} onChange={updateField('unit')} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth disabled={isView} label="Category" value={form.category || ''} onChange={updateField('category')} /></Grid>
          <Grid item xs={12} md={4}><TextField required select fullWidth disabled={isView || isEdit} label="Site" value={form.siteId || ''} onChange={updateSite}>{sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField select fullWidth disabled={isView || !form.siteId} label="Preferred Vendor" value={form.preferredVendorId || ''} onChange={updateField('preferredVendorId')}><MenuItem value="">No preferred vendor</MenuItem>{vendors.map((vendor) => <MenuItem key={vendor.id} value={vendor.id}>{vendor.vendorName}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={3}><TextField type="number" fullWidth disabled={isView || isEdit} label="Opening Stock" value={form.currentStock ?? 0} onChange={updateField('currentStock')} /></Grid>
          <Grid item xs={12} md={3}><TextField type="number" fullWidth disabled={isView} label="Minimum Stock" value={form.minimumStock ?? 0} onChange={updateField('minimumStock')} /></Grid>
          <Grid item xs={12} md={3}><TextField type="number" fullWidth disabled={isView} label="Unit Cost" value={form.unitCost ?? 0} onChange={updateField('unitCost')} /></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth disabled={isView} label="Status" value={form.status || 'ACTIVE'} onChange={updateField('status')}><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="INACTIVE">Inactive</MenuItem></TextField></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth disabled={isView} label="Storage Location" value={form.storageLocation || ''} onChange={updateField('storageLocation')} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth disabled={isView} multiline minRows={2} label="Description" value={form.description || ''} onChange={updateField('description')} /></Grid>
        </Grid>
        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          {!isView && <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>}
          <Button variant="outlined" onClick={() => navigate('/inventory/spare-parts')}>{isView ? 'Back' : 'Cancel'}</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default SparePartFormPage;

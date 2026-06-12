import React from 'react';
import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { createEquipment, getEquipmentById, updateEquipment } from '../../services/equipmentService';
import { getSites } from '../../services/siteService';

const initialForm = {
  equipmentCode: '',
  equipmentName: '',
  siteId: '',
  category: '',
  location: '',
  manufacturer: '',
  modelNumber: '',
  serialNumber: '',
  installationDate: '',
  warrantyExpiryDate: '',
  status: 'ACTIVE',
  criticality: 'MEDIUM',
};

function EquipmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getSites().then((data) => setSites(data.filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  React.useEffect(() => {
    if (isEdit) {
      getEquipmentById(id).then((data) => setForm({ ...initialForm, ...data })).catch(() => setError('Unable to load equipment.'));
    }
  }, [id, isEdit]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, siteId: Number(form.siteId) };
      if (isEdit) {
        await updateEquipment(id, payload);
      } else {
        await createEquipment(payload);
      }
      navigate('/equipment');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save equipment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>{isEdit ? 'Edit Equipment' : 'Add Equipment'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><TextField required fullWidth label="Equipment Code" value={form.equipmentCode} onChange={updateField('equipmentCode')} /></Grid>
          <Grid item xs={12} md={4}><TextField required fullWidth label="Equipment Name" value={form.equipmentName} onChange={updateField('equipmentName')} /></Grid>
          <Grid item xs={12} md={4}><TextField required select fullWidth label="Site" value={form.siteId || ''} onChange={updateField('siteId')}>{sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField required fullWidth label="Category" value={form.category} onChange={updateField('category')} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Location" value={form.location || ''} onChange={updateField('location')} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Manufacturer" value={form.manufacturer || ''} onChange={updateField('manufacturer')} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Model Number" value={form.modelNumber || ''} onChange={updateField('modelNumber')} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Serial Number" value={form.serialNumber || ''} onChange={updateField('serialNumber')} /></Grid>
          <Grid item xs={12} md={4}><TextField select fullWidth label="Status" value={form.status || 'ACTIVE'} onChange={updateField('status')}><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="INACTIVE">Inactive</MenuItem><MenuItem value="UNDER_MAINTENANCE">Under Maintenance</MenuItem><MenuItem value="RETIRED">Retired</MenuItem></TextField></Grid>
          <Grid item xs={12} md={4}><TextField type="date" fullWidth label="Installation Date" value={form.installationDate || ''} onChange={updateField('installationDate')} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={4}><TextField type="date" fullWidth label="Warranty Expiry" value={form.warrantyExpiryDate || ''} onChange={updateField('warrantyExpiryDate')} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={4}><TextField select fullWidth label="Criticality" value={form.criticality || 'MEDIUM'} onChange={updateField('criticality')}><MenuItem value="LOW">Low</MenuItem><MenuItem value="MEDIUM">Medium</MenuItem><MenuItem value="HIGH">High</MenuItem><MenuItem value="CRITICAL">Critical</MenuItem></TextField></Grid>
        </Grid>
        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          <Button variant="outlined" onClick={() => navigate('/equipment')}>Cancel</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EquipmentFormPage;

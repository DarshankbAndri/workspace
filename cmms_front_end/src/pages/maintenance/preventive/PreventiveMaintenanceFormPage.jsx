import React from 'react';
import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getEquipments } from '../../../services/equipmentService';
import { getSites } from '../../../services/siteService';
import { getVendorsBySite } from '../../../services/vendorService';
import { createPMSchedule, getPMScheduleById, updatePMSchedule } from '../../../services/preventiveMaintenanceService';

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  siteId: '',
  equipmentId: '',
  vendorId: '',
  title: '',
  description: '',
  frequency: 'MONTHLY',
  priority: 'MEDIUM',
  assignedTo: '',
  startDate: today(),
  nextDueDate: today(),
  active: 'true',
};

const frequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function PreventiveMaintenanceFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && !location.pathname.endsWith('/view');
  const isView = location.pathname.endsWith('/view');
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    Promise.all([getSites(), getEquipments()])
      .then(([siteRows, equipmentRows]) => {
        setSites((siteRows || []).filter((site) => site.status !== 'INACTIVE'));
        setEquipments(equipmentRows || []);
      })
      .catch(() => setError('Unable to load form data.'));
  }, []);

  React.useEffect(() => {
    if (id) {
      getPMScheduleById(id)
        .then((data) => setForm({
          ...initialForm,
          ...data,
          siteId: data.siteId || '',
          equipmentId: data.equipmentId || '',
          vendorId: data.vendorId || '',
          startDate: data.startDate || today(),
          nextDueDate: data.nextDueDate || data.startDate || today(),
          active: data.active === false ? 'false' : 'true',
        }))
        .catch((err) => setError(err.response?.data?.message || 'Unable to load PM schedule.'));
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

  const filteredEquipments = equipments.filter((equipment) => String(equipment.siteId || '') === String(form.siteId || ''));
  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'startDate' && !isEdit ? { nextDueDate: value } : {}),
    }));
  };
  const updateSite = (event) => setForm((current) => ({ ...current, siteId: event.target.value, equipmentId: '', vendorId: '' }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        siteId: Number(form.siteId),
        equipmentId: Number(form.equipmentId),
        vendorId: form.vendorId ? Number(form.vendorId) : null,
        active: form.active !== 'false',
      };
      if (isEdit) {
        await updatePMSchedule(id, payload);
      } else {
        await createPMSchedule(payload);
      }
      navigate('/maintenance/preventive');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save PM schedule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>{isView ? 'View PM Schedule' : isEdit ? 'Edit PM Schedule' : 'Add PM Schedule'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField required select fullWidth disabled={isView} label="Site" value={form.siteId} onChange={updateSite}>{sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={4}><TextField required select fullWidth disabled={isView || !form.siteId} label="Equipment" value={form.equipmentId} onChange={updateField('equipmentId')} helperText={form.siteId && filteredEquipments.length === 0 ? 'No equipment found for this site.' : ''}>{filteredEquipments.map((item) => <MenuItem key={item.id} value={item.id}>{item.equipmentCode} - {item.equipmentName}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={4}><TextField select fullWidth disabled={isView || !form.siteId} label="Assigned Vendor" value={form.vendorId} onChange={updateField('vendorId')} helperText={form.siteId && vendors.length === 0 ? 'No vendors assigned to this site.' : ''}><MenuItem value="">Internal team</MenuItem>{vendors.map((item) => <MenuItem key={item.id} value={item.id}>{item.vendorName}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth disabled={isView} label="Assigned To" value={form.assignedTo || ''} onChange={updateField('assignedTo')} /></Grid>
            <Grid item xs={12} md={5}><TextField required fullWidth disabled={isView} label="PM Task" value={form.title || ''} onChange={updateField('title')} /></Grid>
            <Grid item xs={12} md={3}><TextField required select fullWidth disabled={isView} label="Frequency" value={form.frequency || 'MONTHLY'} onChange={updateField('frequency')}>{frequencies.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth disabled={isView} label="Priority" value={form.priority || 'MEDIUM'} onChange={updateField('priority')}>{priorities.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={2}><TextField select fullWidth disabled={isView} label="Status" value={String(form.active)} onChange={updateField('active')}><MenuItem value="true">Active</MenuItem><MenuItem value="false">Inactive</MenuItem></TextField></Grid>
            <Grid item xs={12} md={3}><TextField required type="date" fullWidth disabled={isView} label="Start Date" value={form.startDate || ''} onChange={updateField('startDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField required type="date" fullWidth disabled={isView} label="Next Due Date" value={form.nextDueDate || ''} onChange={updateField('nextDueDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={6}><TextField required fullWidth disabled={isView} multiline minRows={2} label="Description" value={form.description || ''} onChange={updateField('description')} /></Grid>
          </Grid>
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            {!isView && <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>}
            <Button variant="outlined" onClick={() => navigate('/maintenance/preventive')}>{isView ? 'Back' : 'Cancel'}</Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default PreventiveMaintenanceFormPage;

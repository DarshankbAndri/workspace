import React from 'react';
import { Alert, Box, Button, Chip, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createMaintenanceRequest, getMaintenanceRequestById, updateMaintenanceRequest } from '../../../services/maintenanceService';
import { getEquipments } from '../../../services/equipmentService';
import { getSites } from '../../../services/siteService';

const initialForm = {
  siteId: '',
  equipmentId: '',
  requestType: 'BREAKDOWN',
  priority: 'MEDIUM',
  status: 'OPEN',
  title: '',
  description: '',
  reportedBy: '',
  requestedDate: new Date().toISOString().slice(0, 10),
  targetCompletionDate: '',
};

function MaintenanceRequestFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && !location.pathname.endsWith('/view');
  const isView = location.pathname.endsWith('/view');
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
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
      getMaintenanceRequestById(id)
        .then((data) => setForm({ ...initialForm, ...data, siteId: data.siteId || '', equipmentId: data.equipmentId || '', requestedDate: data.requestedDate || '', targetCompletionDate: data.targetCompletionDate || '' }))
        .catch((err) => setError(err.response?.data?.message || 'Unable to load maintenance request.'));
    }
  }, [id]);

  const formEquipments = equipments.filter((equipment) => String(equipment.siteId || '') === String(form.siteId || ''));
  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSite = (event) => setForm((current) => ({ ...current, siteId: event.target.value, equipmentId: '' }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, siteId: Number(form.siteId), equipmentId: Number(form.equipmentId) };
      if (isEdit) {
        await updateMaintenanceRequest(id, payload);
      } else {
        await createMaintenanceRequest(payload);
      }
      navigate('/maintenance/requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save maintenance request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1 }}>
        <Typography variant="h4" fontWeight={800}>{isView ? 'View Request' : isEdit ? 'Edit Request' : 'Add Request'}</Typography>
        {form.status && <Chip size="small" label={form.status} color={form.status.includes('PENDING') ? 'warning' : form.status === 'REJECTED' ? 'error' : 'default'} />}
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField required select fullWidth disabled={isView} label="Site" value={form.siteId} onChange={updateSite}>{sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={4}><TextField required select fullWidth disabled={isView || !form.siteId} label="Equipment" value={form.equipmentId} onChange={updateField('equipmentId')}>{formEquipments.map((item) => <MenuItem key={item.id} value={item.id}>{item.equipmentCode} - {item.equipmentName}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={4}><TextField required fullWidth disabled={isView} label="Title" value={form.title || ''} onChange={updateField('title')} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth disabled={isView} label="Reported By" value={form.reportedBy || ''} onChange={updateField('reportedBy')} /></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth disabled={isView} label="Type" value={form.requestType || 'BREAKDOWN'} onChange={updateField('requestType')}><MenuItem value="BREAKDOWN">Breakdown</MenuItem><MenuItem value="PREVENTIVE">Preventive</MenuItem><MenuItem value="INSPECTION">Inspection</MenuItem><MenuItem value="CALIBRATION">Calibration</MenuItem></TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth disabled={isView} label="Priority" value={form.priority || 'MEDIUM'} onChange={updateField('priority')}><MenuItem value="LOW">Low</MenuItem><MenuItem value="MEDIUM">Medium</MenuItem><MenuItem value="HIGH">High</MenuItem><MenuItem value="URGENT">Urgent</MenuItem></TextField></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth disabled={isView} label="Status" value={form.status || 'OPEN'} onChange={updateField('status')}><MenuItem value="OPEN">Open</MenuItem><MenuItem value="IN_PROGRESS">In Progress</MenuItem><MenuItem value="ON_HOLD">On Hold</MenuItem><MenuItem value="CLOSED">Closed</MenuItem><MenuItem value="CANCELLED">Cancelled</MenuItem></TextField></Grid>
            <Grid item xs={12} md={3}><TextField type="date" fullWidth disabled={isView} label="Requested Date" value={form.requestedDate || ''} onChange={updateField('requestedDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField type="date" fullWidth disabled={isView} label="Target Completion" value={form.targetCompletionDate || ''} onChange={updateField('targetCompletionDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={9}><TextField required fullWidth disabled={isView} multiline minRows={2} label="Description" value={form.description || ''} onChange={updateField('description')} /></Grid>
          </Grid>
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            {!isView && <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>}
            <Button variant="outlined" onClick={() => navigate('/maintenance/requests')}>{isView ? 'Back' : 'Cancel'}</Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default MaintenanceRequestFormPage;

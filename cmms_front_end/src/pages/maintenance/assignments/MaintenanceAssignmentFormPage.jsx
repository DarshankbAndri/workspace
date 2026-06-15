import React from 'react';
import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getVendorsBySite } from '../../../services/vendorService';
import { getSites } from '../../../services/siteService';
import { createMaintenanceAssignment, getMaintenanceAssignmentById, getRequestsBySite, updateMaintenanceAssignment } from '../../../services/maintenanceService';

const initialForm = {
  siteId: '',
  requestId: '',
  vendorId: '',
  assignedTo: '',
  assignedDate: new Date().toISOString().slice(0, 10),
  plannedStartDate: '',
  plannedEndDate: '',
  actualStartDate: '',
  actualEndDate: '',
  status: 'ASSIGNED',
  estimatedCost: '',
  actualCost: '',
  remarks: '',
};

function MaintenanceAssignmentFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && !location.pathname.endsWith('/view');
  const isView = location.pathname.endsWith('/view');
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getSites().then((data) => setSites((data || []).filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  React.useEffect(() => {
    if (id) {
      getMaintenanceAssignmentById(id)
        .then((data) => setForm({ ...initialForm, ...data, siteId: data.siteId || '', requestId: data.requestId || '', vendorId: data.vendorId || '', estimatedCost: data.estimatedCost ?? '', actualCost: data.actualCost ?? '' }))
        .catch((err) => setError(err.response?.data?.message || 'Unable to load assignment.'));
    }
  }, [id]);

  React.useEffect(() => {
    if (!form.siteId) {
      setRequests([]);
      setVendors([]);
      return;
    }
    Promise.all([getRequestsBySite(form.siteId), getVendorsBySite(form.siteId)])
      .then(([requestRows, vendorRows]) => {
        setRequests(requestRows || []);
        setVendors(vendorRows || []);
      })
      .catch(() => setError('Unable to load requests or vendors for selected site.'));
  }, [form.siteId]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSite = (event) => setForm((current) => ({ ...current, siteId: event.target.value, requestId: '', vendorId: '' }));
  const updateRequest = (event) => setForm((current) => ({ ...current, requestId: event.target.value, vendorId: '' }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.siteId || !form.requestId || !form.vendorId) {
      setError('Site, maintenance request, and vendor are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        siteId: Number(form.siteId),
        requestId: Number(form.requestId),
        vendorId: Number(form.vendorId),
        estimatedCost: form.estimatedCost === '' ? null : Number(form.estimatedCost),
        actualCost: form.actualCost === '' ? null : Number(form.actualCost),
      };
      if (isEdit) {
        await updateMaintenanceAssignment(id, payload);
      } else {
        await createMaintenanceAssignment(payload);
      }
      navigate('/maintenance/assignments');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save assignment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>{isView ? 'View Assignment' : isEdit ? 'Edit Assignment' : 'Add Assignment'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField required select fullWidth disabled={isView} label="Site" value={form.siteId} onChange={updateSite}>{sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={4}><TextField required select fullWidth disabled={isView || !form.siteId} label="Request" value={form.requestId} onChange={updateRequest} helperText={form.siteId && requests.length === 0 ? 'No maintenance requests found for this site.' : ''}>{requests.map((item) => <MenuItem key={item.id} value={item.id}>{item.requestNumber} - {item.title}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={4}><TextField required select fullWidth disabled={isView || !form.siteId || !form.requestId} label="Vendor" value={form.vendorId} onChange={updateField('vendorId')} helperText={form.siteId && vendors.length === 0 ? 'No vendors assigned to this site.' : ''}>{vendors.map((item) => <MenuItem key={item.id} value={item.id}>{item.vendorName}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={4}><TextField required fullWidth disabled={isView} label="Assigned To" value={form.assignedTo || ''} onChange={updateField('assignedTo')} /></Grid>
            <Grid item xs={12} md={3}><TextField type="date" fullWidth disabled={isView} label="Assigned Date" value={form.assignedDate || ''} onChange={updateField('assignedDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField type="date" fullWidth disabled={isView} label="Planned Start" value={form.plannedStartDate || ''} onChange={updateField('plannedStartDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField type="date" fullWidth disabled={isView} label="Planned End" value={form.plannedEndDate || ''} onChange={updateField('plannedEndDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField select fullWidth disabled={isView} label="Status" value={form.status || 'ASSIGNED'} onChange={updateField('status')}><MenuItem value="ASSIGNED">Assigned</MenuItem><MenuItem value="IN_PROGRESS">In Progress</MenuItem><MenuItem value="COMPLETED">Completed</MenuItem><MenuItem value="CANCELLED">Cancelled</MenuItem></TextField></Grid>
            <Grid item xs={12} md={3}><TextField type="date" fullWidth disabled={isView} label="Actual Start" value={form.actualStartDate || ''} onChange={updateField('actualStartDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField type="date" fullWidth disabled={isView} label="Actual End" value={form.actualEndDate || ''} onChange={updateField('actualEndDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField type="number" fullWidth disabled={isView} label="Estimated Cost" value={form.estimatedCost} onChange={updateField('estimatedCost')} /></Grid>
            <Grid item xs={12} md={3}><TextField type="number" fullWidth disabled={isView} label="Actual Cost" value={form.actualCost} onChange={updateField('actualCost')} /></Grid>
            <Grid item xs={12}><TextField fullWidth disabled={isView} multiline minRows={2} label="Remarks" value={form.remarks || ''} onChange={updateField('remarks')} /></Grid>
          </Grid>
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            {!isView && <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>}
            <Button variant="outlined" onClick={() => navigate('/maintenance/assignments')}>{isView ? 'Back' : 'Cancel'}</Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default MaintenanceAssignmentFormPage;

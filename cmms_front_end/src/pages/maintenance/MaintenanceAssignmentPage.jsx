import React from 'react';
import { Alert, Box, Button, Grid, IconButton, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Clear, Delete, Edit, Save } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getVendorsBySite } from '../../services/vendorService';
import { getSites } from '../../services/siteService';
import { createMaintenanceAssignment, deleteMaintenanceAssignment, getMaintenanceAssignments, getRequestsBySite, updateMaintenanceAssignment } from '../../services/maintenanceService';

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

function MaintenanceAssignmentPage() {
  const [rows, setRows] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
  const [form, setForm] = React.useState(initialForm);
  const [editingId, setEditingId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadData = React.useCallback(() => {
    setLoading(true);
    Promise.all([getMaintenanceAssignments(), getSites()])
      .then(([assignmentRows, siteRows]) => {
        setRows(assignmentRows);
        setSites(siteRows.filter((site) => site.status !== 'INACTIVE'));
      })
      .catch(() => setError('Unable to load maintenance assignment data.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSite = (event) => {
    const siteId = event.target.value;
    setForm((current) => ({ ...current, siteId, requestId: '', vendorId: '' }));
  };
  const updateRequest = (event) => setForm((current) => ({ ...current, requestId: event.target.value, vendorId: '' }));
  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setRequests([]);
    setVendors([]);
  };

  React.useEffect(() => {
    if (!form.siteId) {
      setRequests([]);
      setVendors([]);
      return;
    }
    Promise.all([getRequestsBySite(form.siteId), getVendorsBySite(form.siteId)])
      .then(([requestRows, vendorRows]) => {
        setRequests(requestRows);
        setVendors(vendorRows);
      })
      .catch(() => setError('Unable to load requests or vendors for selected site.'));
  }, [form.siteId]);

  const payload = {
    ...form,
    siteId: Number(form.siteId),
    requestId: Number(form.requestId),
    vendorId: Number(form.vendorId),
    estimatedCost: form.estimatedCost === '' ? null : Number(form.estimatedCost),
    actualCost: form.actualCost === '' ? null : Number(form.actualCost),
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.siteId) {
      setError('Site is required.');
      return;
    }
    if (!form.requestId) {
      setError('Maintenance request is required.');
      return;
    }
    if (!form.vendorId) {
      setError('Vendor is required.');
      return;
    }
    try {
      if (editingId) {
        await updateMaintenanceAssignment(editingId, payload);
      } else {
        await createMaintenanceAssignment(payload);
      }
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save assignment.');
    }
  };

  const editRow = (row) => {
    setEditingId(row.id);
    setForm({
      siteId: row.siteId || '',
      requestId: row.requestId || '',
      vendorId: row.vendorId || '',
      assignedTo: row.assignedTo || '',
      assignedDate: row.assignedDate || '',
      plannedStartDate: row.plannedStartDate || '',
      plannedEndDate: row.plannedEndDate || '',
      actualStartDate: row.actualStartDate || '',
      actualEndDate: row.actualEndDate || '',
      status: row.status || 'ASSIGNED',
      estimatedCost: row.estimatedCost ?? '',
      actualCost: row.actualCost ?? '',
      remarks: row.remarks || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    await deleteMaintenanceAssignment(id);
    loadData();
  };

  const columns = [
    { field: 'siteName', headerName: 'Site', minWidth: 170, flex: 0.8 },
    { field: 'requestNumber', headerName: 'Request No.', minWidth: 180, flex: 1 },
    { field: 'requestTitle', headerName: 'Request', minWidth: 220, flex: 1.2 },
    { field: 'assignedTo', headerName: 'Assigned To', minWidth: 150, flex: 0.8 },
    { field: 'vendorName', headerName: 'Vendor', minWidth: 180, flex: 1 },
    { field: 'assignedDate', headerName: 'Assigned', minWidth: 120, flex: 0.7 },
    { field: 'status', headerName: 'Status', minWidth: 130, flex: 0.7 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 110,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton aria-label="Edit assignment" onClick={() => editRow(row)}><Edit fontSize="small" /></IconButton>
          <IconButton aria-label="Delete assignment" color="error" onClick={() => handleDelete(row.id)}><Delete fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800}>Maintenance Assignments</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Assign work orders to technicians or vendors and track progress.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2.5, mb: 2, borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><TextField required select fullWidth label="Site" value={form.siteId} onChange={updateSite}>{sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField required select fullWidth disabled={!form.siteId} label="Request" value={form.requestId} onChange={updateRequest} helperText={form.siteId && requests.length === 0 ? 'No maintenance requests found for this site.' : ''}>{requests.map((item) => <MenuItem key={item.id} value={item.id}>{item.requestNumber} - {item.title}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField required select fullWidth disabled={!form.siteId || !form.requestId} label="Vendor" value={form.vendorId} onChange={updateField('vendorId')} helperText={form.siteId && vendors.length === 0 ? 'No vendors assigned to this site.' : ''}>{vendors.map((item) => <MenuItem key={item.id} value={item.id}>{item.vendorName}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField required fullWidth label="Assigned To" value={form.assignedTo} onChange={updateField('assignedTo')} /></Grid>
          <Grid item xs={12} md={3}><TextField type="date" fullWidth label="Assigned Date" value={form.assignedDate} onChange={updateField('assignedDate')} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={3}><TextField type="date" fullWidth label="Planned Start" value={form.plannedStartDate || ''} onChange={updateField('plannedStartDate')} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={3}><TextField type="date" fullWidth label="Planned End" value={form.plannedEndDate || ''} onChange={updateField('plannedEndDate')} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Status" value={form.status} onChange={updateField('status')}><MenuItem value="ASSIGNED">Assigned</MenuItem><MenuItem value="IN_PROGRESS">In Progress</MenuItem><MenuItem value="COMPLETED">Completed</MenuItem><MenuItem value="CANCELLED">Cancelled</MenuItem></TextField></Grid>
          <Grid item xs={12} md={3}><TextField type="date" fullWidth label="Actual Start" value={form.actualStartDate || ''} onChange={updateField('actualStartDate')} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={3}><TextField type="date" fullWidth label="Actual End" value={form.actualEndDate || ''} onChange={updateField('actualEndDate')} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={3}><TextField type="number" fullWidth label="Estimated Cost" value={form.estimatedCost} onChange={updateField('estimatedCost')} /></Grid>
          <Grid item xs={12} md={3}><TextField type="number" fullWidth label="Actual Cost" value={form.actualCost} onChange={updateField('actualCost')} /></Grid>
          <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Remarks" value={form.remarks} onChange={updateField('remarks')} /></Grid>
        </Grid>
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" startIcon={<Save />}>{editingId ? 'Update Assignment' : 'Create Assignment'}</Button>
          {editingId && <Button variant="outlined" startIcon={<Clear />} onClick={resetForm}>Clear</Button>}
        </Stack>
      </Paper>
      <Paper sx={{ height: 520, borderRadius: 1 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>
    </Box>
  );
}

export default MaintenanceAssignmentPage;

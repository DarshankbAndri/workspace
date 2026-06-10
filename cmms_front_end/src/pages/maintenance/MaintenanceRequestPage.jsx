import React from 'react';
import { Alert, Box, Button, Grid, IconButton, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Clear, Delete, Edit, Save } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getEquipments } from '../../services/equipmentService';
import { createMaintenanceRequest, deleteMaintenanceRequest, getMaintenanceRequests, updateMaintenanceRequest } from '../../services/maintenanceService';

const initialForm = {
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

function MaintenanceRequestPage() {
  const [rows, setRows] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [form, setForm] = React.useState(initialForm);
  const [editingId, setEditingId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadData = React.useCallback(() => {
    setLoading(true);
    Promise.all([getMaintenanceRequests(), getEquipments()])
      .then(([requestRows, equipmentRows]) => {
        setRows(requestRows);
        setEquipments(equipmentRows);
      })
      .catch(() => setError('Unable to load maintenance request data.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const resetForm = () => { setEditingId(null); setForm(initialForm); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const payload = { ...form, equipmentId: Number(form.equipmentId) };
    try {
      if (editingId) {
        await updateMaintenanceRequest(editingId, payload);
      } else {
        await createMaintenanceRequest(payload);
      }
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save maintenance request.');
    }
  };

  const editRow = (row) => {
    setEditingId(row.id);
    setForm({
      equipmentId: row.equipmentId || '',
      requestType: row.requestType || 'BREAKDOWN',
      priority: row.priority || 'MEDIUM',
      status: row.status || 'OPEN',
      title: row.title || '',
      description: row.description || '',
      reportedBy: row.reportedBy || '',
      requestedDate: row.requestedDate || '',
      targetCompletionDate: row.targetCompletionDate || '',
      requestNumber: row.requestNumber,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance request?')) return;
    await deleteMaintenanceRequest(id);
    loadData();
  };

  const columns = [
    { field: 'requestNumber', headerName: 'Request No.', minWidth: 180, flex: 1 },
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 180, flex: 1 },
    { field: 'title', headerName: 'Title', minWidth: 220, flex: 1.2 },
    { field: 'priority', headerName: 'Priority', minWidth: 110, flex: 0.6 },
    { field: 'status', headerName: 'Status', minWidth: 130, flex: 0.7 },
    { field: 'requestedDate', headerName: 'Requested', minWidth: 120, flex: 0.7 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 110,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton aria-label="Edit request" onClick={() => editRow(row)}><Edit fontSize="small" /></IconButton>
          <IconButton aria-label="Delete request" color="error" onClick={() => handleDelete(row.id)}><Delete fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800}>Maintenance Requests</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Log corrective, preventive, and inspection work requests.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2.5, mb: 2, borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><TextField required select fullWidth label="Equipment" value={form.equipmentId} onChange={updateField('equipmentId')}>{equipments.map((item) => <MenuItem key={item.id} value={item.id}>{item.equipmentCode} - {item.equipmentName}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField required fullWidth label="Title" value={form.title} onChange={updateField('title')} /></Grid>
          <Grid item xs={12} md={4}><TextField fullWidth label="Reported By" value={form.reportedBy} onChange={updateField('reportedBy')} /></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Type" value={form.requestType} onChange={updateField('requestType')}><MenuItem value="BREAKDOWN">Breakdown</MenuItem><MenuItem value="PREVENTIVE">Preventive</MenuItem><MenuItem value="INSPECTION">Inspection</MenuItem><MenuItem value="CALIBRATION">Calibration</MenuItem></TextField></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Priority" value={form.priority} onChange={updateField('priority')}><MenuItem value="LOW">Low</MenuItem><MenuItem value="MEDIUM">Medium</MenuItem><MenuItem value="HIGH">High</MenuItem><MenuItem value="URGENT">Urgent</MenuItem></TextField></Grid>
          <Grid item xs={12} md={3}><TextField select fullWidth label="Status" value={form.status} onChange={updateField('status')}><MenuItem value="OPEN">Open</MenuItem><MenuItem value="IN_PROGRESS">In Progress</MenuItem><MenuItem value="ON_HOLD">On Hold</MenuItem><MenuItem value="CLOSED">Closed</MenuItem><MenuItem value="CANCELLED">Cancelled</MenuItem></TextField></Grid>
          <Grid item xs={12} md={3}><TextField type="date" fullWidth label="Requested Date" value={form.requestedDate} onChange={updateField('requestedDate')} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={3}><TextField type="date" fullWidth label="Target Completion" value={form.targetCompletionDate || ''} onChange={updateField('targetCompletionDate')} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={9}><TextField required fullWidth multiline minRows={2} label="Description" value={form.description} onChange={updateField('description')} /></Grid>
        </Grid>
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" startIcon={<Save />}>{editingId ? 'Update Request' : 'Create Request'}</Button>
          {editingId && <Button variant="outlined" startIcon={<Clear />} onClick={resetForm}>Clear</Button>}
        </Stack>
      </Paper>
      <Paper sx={{ height: 520, borderRadius: 1 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>
    </Box>
  );
}

export default MaintenanceRequestPage;

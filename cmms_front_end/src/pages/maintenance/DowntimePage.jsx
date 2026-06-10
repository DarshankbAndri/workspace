import React from 'react';
import { Alert, Box, Button, FormControlLabel, Grid, IconButton, MenuItem, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import { Clear, Delete, Edit, Save } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getEquipments } from '../../services/equipmentService';
import { createDowntimeEntry, deleteDowntimeEntry, getDowntimeEntries, getMaintenanceRequests, updateDowntimeEntry } from '../../services/maintenanceService';

const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const initialForm = {
  equipmentId: '',
  requestId: '',
  downtimeStart: nowLocal(),
  downtimeEnd: '',
  reason: '',
  planned: false,
  remarks: '',
};

function DowntimePage() {
  const [rows, setRows] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [form, setForm] = React.useState(initialForm);
  const [editingId, setEditingId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadData = React.useCallback(() => {
    setLoading(true);
    Promise.all([getDowntimeEntries(), getEquipments(), getMaintenanceRequests()])
      .then(([downtimeRows, equipmentRows, requestRows]) => {
        setRows(downtimeRows);
        setEquipments(equipmentRows);
        setRequests(requestRows);
      })
      .catch(() => setError('Unable to load downtime data.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSwitch = (event) => setForm((current) => ({ ...current, planned: event.target.checked }));
  const resetForm = () => { setEditingId(null); setForm(initialForm); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const payload = {
      ...form,
      equipmentId: Number(form.equipmentId),
      requestId: form.requestId ? Number(form.requestId) : null,
      downtimeEnd: form.downtimeEnd || null,
    };
    try {
      if (editingId) {
        await updateDowntimeEntry(editingId, payload);
      } else {
        await createDowntimeEntry(payload);
      }
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save downtime entry.');
    }
  };

  const editRow = (row) => {
    setEditingId(row.id);
    setForm({
      equipmentId: row.equipmentId || '',
      requestId: row.requestId || '',
      downtimeStart: row.downtimeStart?.slice(0, 16) || '',
      downtimeEnd: row.downtimeEnd?.slice(0, 16) || '',
      reason: row.reason || '',
      planned: Boolean(row.planned),
      remarks: row.remarks || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this downtime entry?')) return;
    await deleteDowntimeEntry(id);
    loadData();
  };

  const columns = [
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 180, flex: 1 },
    { field: 'requestNumber', headerName: 'Request No.', minWidth: 170, flex: 0.9 },
    { field: 'downtimeStart', headerName: 'Start', minWidth: 170, flex: 0.9 },
    { field: 'downtimeEnd', headerName: 'End', minWidth: 170, flex: 0.9 },
    { field: 'downtimeHours', headerName: 'Hours', minWidth: 100, flex: 0.5 },
    { field: 'reason', headerName: 'Reason', minWidth: 180, flex: 1 },
    { field: 'planned', headerName: 'Planned', minWidth: 100, flex: 0.5, valueFormatter: ({ value }) => (value ? 'Yes' : 'No') },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 110,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton aria-label="Edit downtime" onClick={() => editRow(row)}><Edit fontSize="small" /></IconButton>
          <IconButton aria-label="Delete downtime" color="error" onClick={() => handleDelete(row.id)}><Delete fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800}>Equipment Downtime</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Track planned and unplanned equipment outage windows.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2.5, mb: 2, borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><TextField required select fullWidth label="Equipment" value={form.equipmentId} onChange={updateField('equipmentId')}>{equipments.map((item) => <MenuItem key={item.id} value={item.id}>{item.equipmentCode} - {item.equipmentName}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField select fullWidth label="Related Request" value={form.requestId} onChange={updateField('requestId')}><MenuItem value="">No request</MenuItem>{requests.map((item) => <MenuItem key={item.id} value={item.id}>{item.requestNumber} - {item.title}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={4}><TextField required fullWidth label="Reason" value={form.reason} onChange={updateField('reason')} /></Grid>
          <Grid item xs={12} md={4}><TextField required type="datetime-local" fullWidth label="Downtime Start" value={form.downtimeStart} onChange={updateField('downtimeStart')} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={4}><TextField type="datetime-local" fullWidth label="Downtime End" value={form.downtimeEnd || ''} onChange={updateField('downtimeEnd')} InputLabelProps={{ shrink: true }} /></Grid>
          <Grid item xs={12} md={4}><FormControlLabel control={<Switch checked={Boolean(form.planned)} onChange={updateSwitch} />} label="Planned downtime" /></Grid>
          <Grid item xs={12}><TextField fullWidth multiline minRows={2} label="Remarks" value={form.remarks} onChange={updateField('remarks')} /></Grid>
        </Grid>
        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" startIcon={<Save />}>{editingId ? 'Update Downtime' : 'Create Downtime'}</Button>
          {editingId && <Button variant="outlined" startIcon={<Clear />} onClick={resetForm}>Clear</Button>}
        </Stack>
      </Paper>
      <Paper sx={{ height: 520, borderRadius: 1 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>
    </Box>
  );
}

export default DowntimePage;

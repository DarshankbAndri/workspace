import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Clear, Delete, Edit, Save } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getEquipments } from '../../services/equipmentService';
import {
  createDowntimeEntry,
  deleteDowntimeEntry,
  getDowntimeEntries,
  getMaintenanceRequests,
  updateDowntimeEntry,
} from '../../services/maintenanceService';

const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const initialForm = {
  equipmentId: '',
  requestId: '',
  downtimeStart: nowLocal(),
  downtimeEnd: '',
  reason: '',
  remarks: '',
};

const calculateDuration = (start, end) => {
  if (!start || !end) {
    return null;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return null;
  }

  return {
    minutes,
    hours: Number((minutes / 60).toFixed(2)),
    days: Number((minutes / 1440).toFixed(2)),
  };
};

const formatDuration = (value) => value ?? '-';

function DowntimePage() {
  const [rows, setRows] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [form, setForm] = React.useState(initialForm);
  const [editingId, setEditingId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const duration = React.useMemo(
    () => calculateDuration(form.downtimeStart, form.downtimeEnd),
    [form.downtimeStart, form.downtimeEnd]
  );

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

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...initialForm, downtimeStart: nowLocal() });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.downtimeEnd && !duration) {
      setError('End Time must be after Start Time.');
      return;
    }

    const payload = {
      ...form,
      equipmentId: Number(form.equipmentId),
      requestId: form.requestId ? Number(form.requestId) : null,
      downtimeEnd: form.downtimeEnd || null,
      planned: false,
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
      remarks: row.remarks || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this downtime entry?')) return;
    await deleteDowntimeEntry(id);
    loadData();
  };

  const columns = [
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 190, flex: 1 },
    { field: 'requestNumber', headerName: 'Maintenance Request', minWidth: 170, flex: 0.9 },
    { field: 'downtimeStart', headerName: 'Start Time', minWidth: 170, flex: 0.9 },
    { field: 'downtimeEnd', headerName: 'End Time', minWidth: 170, flex: 0.9, valueFormatter: ({ value }) => value || '-' },
    { field: 'downtimeMinutes', headerName: 'Minutes', minWidth: 100, flex: 0.5, valueFormatter: ({ value }) => formatDuration(value) },
    { field: 'downtimeHours', headerName: 'Hours', minWidth: 100, flex: 0.5, valueFormatter: ({ value }) => formatDuration(value) },
    { field: 'downtimeDays', headerName: 'Days', minWidth: 100, flex: 0.5, valueFormatter: ({ value }) => formatDuration(value) },
    { field: 'reason', headerName: 'Reason', minWidth: 180, flex: 1 },
    { field: 'remarks', headerName: 'Remarks', minWidth: 180, flex: 1 },
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
      <Typography variant="h4" fontWeight={800}>Equipment Downtime Tracking</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Track outage windows and calculate downtime automatically from start and end time.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card component="form" onSubmit={handleSubmit} sx={{ mb: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField required select fullWidth label="Equipment" value={form.equipmentId} onChange={updateField('equipmentId')}>
                {equipments.map((item) => <MenuItem key={item.id} value={item.id}>{item.equipmentCode} - {item.equipmentName}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Maintenance Request" value={form.requestId} onChange={updateField('requestId')}>
                <MenuItem value="">No request</MenuItem>
                {requests.map((item) => <MenuItem key={item.id} value={item.id}>{item.requestNumber} - {item.title}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField required fullWidth label="Reason" value={form.reason} onChange={updateField('reason')} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField required type="datetime-local" fullWidth label="Start Time" value={form.downtimeStart} onChange={updateField('downtimeStart')} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField type="datetime-local" fullWidth label="End Time" value={form.downtimeEnd || ''} onChange={updateField('downtimeEnd')} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <TextField fullWidth label="Minutes" value={duration?.minutes ?? ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={4}>
                  <TextField fullWidth label="Hours" value={duration?.hours ?? ''} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={4}>
                  <TextField fullWidth label="Days" value={duration?.days ?? ''} InputProps={{ readOnly: true }} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={2} label="Remarks" value={form.remarks} onChange={updateField('remarks')} />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" startIcon={<Save />}>{editingId ? 'Update Downtime' : 'Create Downtime'}</Button>
            {editingId && <Button variant="outlined" startIcon={<Clear />} onClick={resetForm}>Clear</Button>}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ height: 540, borderRadius: 1, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Card>
    </Box>
  );
}

export default DowntimePage;

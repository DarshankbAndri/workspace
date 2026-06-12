import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AddTask, Clear, Delete, Edit, PlayArrow, Save } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getEquipments } from '../../services/equipmentService';
import { getVendors } from '../../services/vendorService';
import {
  createPMSchedule,
  deletePMSchedule,
  generateDuePMWorkOrders,
  generatePMWorkOrder,
  getPMSchedules,
  updatePMSchedule,
} from '../../services/preventiveMaintenanceService';

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  equipmentId: '',
  vendorId: '',
  title: '',
  description: '',
  frequency: 'MONTHLY',
  priority: 'MEDIUM',
  assignedTo: '',
  startDate: today(),
  nextDueDate: today(),
  active: true,
};

const frequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const formatPercent = (value) => Number(value || 0).toFixed(2);

function PreventiveMaintenancePage() {
  const [rows, setRows] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
  const [form, setForm] = React.useState(initialForm);
  const [editingId, setEditingId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const loadData = React.useCallback(() => {
    setLoading(true);
    Promise.all([getPMSchedules(), getEquipments(), getVendors()])
      .then(([scheduleRows, equipmentRows, vendorRows]) => {
        setRows(scheduleRows);
        setEquipments(equipmentRows);
        setVendors(vendorRows.filter((vendor) => vendor.active !== false));
      })
      .catch(() => setError('Unable to load preventive maintenance schedules.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'startDate' && !editingId ? { nextDueDate: value } : {}),
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...initialForm, startDate: today(), nextDueDate: today() });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const payload = {
      ...form,
      equipmentId: Number(form.equipmentId),
      vendorId: form.vendorId ? Number(form.vendorId) : null,
      active: form.active !== 'false',
    };

    try {
      if (editingId) {
        await updatePMSchedule(editingId, payload);
        setSuccess('PM schedule updated.');
      } else {
        await createPMSchedule(payload);
        setSuccess('PM schedule created.');
      }
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save PM schedule.');
    } finally {
      setSaving(false);
    }
  };

  const editRow = (row) => {
    setEditingId(row.id);
    setForm({
      equipmentId: row.equipmentId || '',
      vendorId: row.vendorId || '',
      title: row.title || '',
      description: row.description || '',
      frequency: row.frequency || 'MONTHLY',
      priority: row.priority || 'MEDIUM',
      assignedTo: row.assignedTo || '',
      startDate: row.startDate || today(),
      nextDueDate: row.nextDueDate || row.startDate || today(),
      active: row.active === false ? 'false' : 'true',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this PM schedule?')) return;
    await deletePMSchedule(id);
    loadData();
  };

  const handleGenerate = async (id) => {
    setError('');
    setSuccess('');
    try {
      await generatePMWorkOrder(id);
      setSuccess('Work order generated and vendor notification recorded.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate work order.');
    }
  };

  const handleGenerateDue = async () => {
    setError('');
    setSuccess('');
    try {
      const generated = await generateDuePMWorkOrders();
      setSuccess(`${generated.length} due work order${generated.length === 1 ? '' : 's'} generated.`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate due work orders.');
    }
  };

  const columns = [
    { field: 'scheduleCode', headerName: 'Schedule', minWidth: 190, flex: 0.9 },
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 190, flex: 1 },
    { field: 'title', headerName: 'PM Task', minWidth: 220, flex: 1.2 },
    { field: 'frequency', headerName: 'Frequency', minWidth: 130, flex: 0.6 },
    { field: 'nextDueDate', headerName: 'Next Due', minWidth: 130, flex: 0.6 },
    { field: 'vendorName', headerName: 'Vendor', minWidth: 190, flex: 0.9, valueFormatter: ({ value }) => value || '-' },
    {
      field: 'completionPercentage',
      headerName: 'Completion',
      minWidth: 160,
      flex: 0.8,
      renderCell: ({ row }) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant="caption" fontWeight={700}>{formatPercent(row.completionPercentage)}%</Typography>
          <LinearProgress variant="determinate" value={Number(row.completionPercentage || 0)} sx={{ height: 6, borderRadius: 1 }} />
        </Box>
      ),
    },
    { field: 'generatedWorkOrders', headerName: 'WOs', minWidth: 90, flex: 0.4 },
    { field: 'lastNotificationStatus', headerName: 'Vendor Notification', minWidth: 220, flex: 1, valueFormatter: ({ value }) => value || '-' },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 150,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton aria-label="Generate work order" color="primary" onClick={() => handleGenerate(row.id)}><PlayArrow fontSize="small" /></IconButton>
          <IconButton aria-label="Edit PM schedule" onClick={() => editRow(row)}><Edit fontSize="small" /></IconButton>
          <IconButton aria-label="Delete PM schedule" color="error" onClick={() => handleDelete(row.id)}><Delete fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Preventive Maintenance</Typography>
          <Typography variant="body2" color="text.secondary">Schedule recurring maintenance and generate work orders for assigned vendors.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<AddTask />} onClick={handleGenerateDue}>Generate Due Work Orders</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card component="form" onSubmit={handleSubmit} sx={{ mb: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField required select fullWidth label="Equipment" value={form.equipmentId} onChange={updateField('equipmentId')}>
                {equipments.map((item) => <MenuItem key={item.id} value={item.id}>{item.equipmentCode} - {item.equipmentName}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Assigned Vendor" value={form.vendorId} onChange={updateField('vendorId')}>
                <MenuItem value="">Internal team</MenuItem>
                {vendors.map((item) => <MenuItem key={item.id} value={item.id}>{item.vendorName}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Assigned To" value={form.assignedTo} onChange={updateField('assignedTo')} />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField required fullWidth label="PM Task" value={form.title} onChange={updateField('title')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField required select fullWidth label="Frequency" value={form.frequency} onChange={updateField('frequency')}>
                {frequencies.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Priority" value={form.priority} onChange={updateField('priority')}>
                {priorities.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Status" value={String(form.active)} onChange={updateField('active')}>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField required type="date" fullWidth label="Start Date" value={form.startDate} onChange={updateField('startDate')} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField required type="date" fullWidth label="Next Due Date" value={form.nextDueDate} onChange={updateField('nextDueDate')} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField required fullWidth multiline minRows={2} label="Description" value={form.description} onChange={updateField('description')} />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>{editingId ? 'Update Schedule' : 'Create Schedule'}</Button>
            {editingId && <Button variant="outlined" startIcon={<Clear />} onClick={resetForm}>Clear</Button>}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ height: 560, borderRadius: 1, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Card>
    </Box>
  );
}

export default PreventiveMaintenancePage;

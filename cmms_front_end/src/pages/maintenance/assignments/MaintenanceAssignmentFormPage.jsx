import React from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Delete, Edit, Save } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getVendorsBySite } from '../../../services/vendorService';
import { getSites } from '../../../services/siteService';
import { createMaintenanceAssignment, getMaintenanceAssignmentById, getRequestsBySite, updateMaintenanceAssignment } from '../../../services/maintenanceService';
import { addAssignmentSpare, deleteAssignmentSpare, getAssignmentSpares, getSparePartsBySite, updateAssignmentSpare } from '../../../services/sparePartService';

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

const initialSpareEditDialog = { open: false, row: null, quantityUsed: '', remarks: '' };

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
  const [siteSpares, setSiteSpares] = React.useState([]);
  const [spareRows, setSpareRows] = React.useState([]);
  const [spareForm, setSpareForm] = React.useState({ stockId: '', quantityUsed: '', remarks: '' });
  const [spareEditDialog, setSpareEditDialog] = React.useState(initialSpareEditDialog);
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
      setSiteSpares([]);
      return;
    }
    Promise.all([getRequestsBySite(form.siteId), getVendorsBySite(form.siteId), getSparePartsBySite(form.siteId)])
      .then(([requestRows, vendorRows, spareRows]) => {
        setRequests((requestRows || []).filter((request) => !['PENDING_APPROVAL', 'CLOSE_PENDING_APPROVAL', 'REJECTED'].includes(request.status)));
        setVendors(vendorRows || []);
        setSiteSpares(spareRows || []);
      })
      .catch(() => setError('Unable to load requests, vendors, or spare parts for selected site.'));
  }, [form.siteId]);

  const loadSpares = React.useCallback(() => {
    if (!id) {
      setSpareRows([]);
      return;
    }
    getAssignmentSpares(id)
      .then((data) => setSpareRows(data || []))
      .catch(() => setError('Unable to load assignment spare usage.'));
  }, [id]);

  React.useEffect(() => { loadSpares(); }, [loadSpares]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSite = (event) => setForm((current) => ({ ...current, siteId: event.target.value, requestId: '', vendorId: '' }));
  const updateRequest = (event) => setForm((current) => ({ ...current, requestId: event.target.value, vendorId: '' }));
  const updateSpareField = (field) => (event) => setSpareForm((current) => ({ ...current, [field]: event.target.value }));

  const materialCost = spareRows.reduce((sum, item) => sum + Number(item.totalCost || 0), 0);
  const serviceCost = Number(form.actualCost || 0);
  const totalActualCost = serviceCost + materialCost;

  const handleAddSpare = async () => {
    setError('');
    if (!id) {
      setError('Save the assignment before adding spare parts.');
      return;
    }
    if (!spareForm.stockId || !spareForm.quantityUsed) {
      setError('Spare part and quantity are required.');
      return;
    }
    try {
      await addAssignmentSpare(id, {
        stockId: Number(spareForm.stockId),
        quantityUsed: Number(spareForm.quantityUsed),
        remarks: spareForm.remarks,
      });
      setSpareForm({ stockId: '', quantityUsed: '', remarks: '' });
      const selected = siteSpares.find((item) => String(item.id) === String(spareForm.stockId));
      if (selected) {
        setSiteSpares((current) => current.map((item) => String(item.id) === String(selected.id)
          ? { ...item, currentStock: Number(item.currentStock || 0) - Number(spareForm.quantityUsed || 0) }
          : item));
      }
      loadSpares();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add spare part usage.');
    }
  };

  const handleDeleteSpare = async (usageId) => {
    if (!window.confirm('Remove this spare usage and return stock?')) return;
    try {
      await deleteAssignmentSpare(id, usageId);
      loadSpares();
      if (form.siteId) {
        getSparePartsBySite(form.siteId).then((data) => setSiteSpares(data || []));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove spare usage.');
    }
  };

  const handleOpenEditSpare = (row) => {
    setSpareEditDialog({ open: true, row, quantityUsed: row.quantityUsed ?? '', remarks: row.remarks || '' });
  };

  const handleUpdateSpare = async () => {
    setError('');
    try {
      await updateAssignmentSpare(id, spareEditDialog.row.id, {
        stockId: spareEditDialog.row.stockId,
        quantityUsed: Number(spareEditDialog.quantityUsed),
        remarks: spareEditDialog.remarks,
      });
      setSpareEditDialog(initialSpareEditDialog);
      loadSpares();
      if (form.siteId) {
        getSparePartsBySite(form.siteId).then((data) => setSiteSpares(data || []));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update spare usage.');
    }
  };

  const spareColumns = [
    { field: 'partCode', headerName: 'Part Code', minWidth: 140, flex: 0.8 },
    { field: 'partName', headerName: 'Part Name', minWidth: 220, flex: 1.2 },
    { field: 'quantityUsed', headerName: 'Qty', minWidth: 100, flex: 0.5 },
    { field: 'unit', headerName: 'Unit', minWidth: 90, flex: 0.4 },
    { field: 'unitCost', headerName: 'Unit Cost', minWidth: 120, flex: 0.6 },
    { field: 'totalCost', headerName: 'Total Cost', minWidth: 130, flex: 0.7 },
    { field: 'remarks', headerName: 'Remarks', minWidth: 180, flex: 1 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 110,
      renderCell: ({ row }) => !isView && (
        <Stack direction="row" spacing={0.5}>
          <IconButton aria-label="Edit spare usage" onClick={() => handleOpenEditSpare(row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton aria-label="Remove spare usage" color="error" onClick={() => handleDeleteSpare(row.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

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
            <Grid item xs={12} md={3}><TextField type="number" fullWidth disabled={isView} label="Service/Vendor Cost" value={form.actualCost} onChange={updateField('actualCost')} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth disabled label="Material Cost" value={materialCost.toFixed(2)} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth disabled label="Total Actual Cost" value={totalActualCost.toFixed(2)} /></Grid>
            <Grid item xs={12}><TextField fullWidth disabled={isView} multiline minRows={2} label="Remarks" value={form.remarks || ''} onChange={updateField('remarks')} /></Grid>
          </Grid>
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            {!isView && <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>}
            <Button variant="outlined" onClick={() => navigate('/maintenance/assignments')}>{isView ? 'Back' : 'Cancel'}</Button>
          </Stack>
        </Paper>
      </Box>
      {id && (
        <Paper sx={{ p: 3, borderRadius: 1, mt: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Used Spare Parts</Typography>
          {!isView && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={5}>
                <TextField select fullWidth label="Spare Part" value={spareForm.stockId} onChange={updateSpareField('stockId')}>
                  {siteSpares.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.partCode} - {item.partName} | Available: {item.currentStock} {item.unit}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}><TextField type="number" fullWidth label="Quantity" value={spareForm.quantityUsed} onChange={updateSpareField('quantityUsed')} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Remarks" value={spareForm.remarks} onChange={updateSpareField('remarks')} /></Grid>
              <Grid item xs={12} md={2}><Button fullWidth variant="contained" sx={{ height: '100%' }} onClick={handleAddSpare}>Add Spare</Button></Grid>
            </Grid>
          )}
          <Box sx={{ height: 320 }}>
            <DataGrid rows={spareRows} columns={spareColumns} disableRowSelectionOnClick pageSizeOptions={[5, 10]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} />
          </Box>
        </Paper>
      )}
      <Dialog open={spareEditDialog.open} onClose={() => setSpareEditDialog(initialSpareEditDialog)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Spare Usage</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {spareEditDialog.row?.partCode} - {spareEditDialog.row?.partName}
          </Typography>
          <TextField
            required
            type="number"
            label="Quantity Used"
            value={spareEditDialog.quantityUsed}
            onChange={(event) => setSpareEditDialog((current) => ({ ...current, quantityUsed: event.target.value }))}
          />
          <TextField
            multiline
            minRows={2}
            label="Remarks"
            value={spareEditDialog.remarks}
            onChange={(event) => setSpareEditDialog((current) => ({ ...current, remarks: event.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpareEditDialog(initialSpareEditDialog)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateSpare}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MaintenanceAssignmentFormPage;

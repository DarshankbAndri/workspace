import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getSites } from '../../services/siteService';
import { getReorderRequests, updateReorderRequest } from '../../services/sparePartService';

const statuses = ['REQUESTED', 'ORDERED', 'RECEIVED', 'CANCELLED'];
const initialEditDialog = { open: false, row: null, status: '', requestedQuantity: '', estimatedUnitCost: '', expectedDate: '', remarks: '' };

function SparePartReorderPage() {
  const [rows, setRows] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [filters, setFilters] = React.useState({ siteId: '', status: '' });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [editDialog, setEditDialog] = React.useState(initialEditDialog);

  const loadRows = React.useCallback(() => {
    setLoading(true);
    setError('');
    getReorderRequests({
      siteId: filters.siteId || undefined,
      status: filters.status || undefined,
    })
      .then((data) => setRows(data || []))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load reorder requests.'))
      .finally(() => setLoading(false));
  }, [filters]);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    getSites().then((data) => setSites((data || []).filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  const openEditDialog = (row) => {
    setEditDialog({
      open: true,
      row,
      status: row.status || 'REQUESTED',
      requestedQuantity: row.requestedQuantity ?? '',
      estimatedUnitCost: row.estimatedUnitCost ?? '',
      expectedDate: row.expectedDate || '',
      remarks: row.remarks || '',
    });
  };

  const submitEditDialog = async () => {
    setError('');
    try {
      await updateReorderRequest(editDialog.row.id, {
        status: editDialog.status,
        requestedQuantity: Number(editDialog.requestedQuantity),
        estimatedUnitCost: editDialog.estimatedUnitCost === '' ? null : Number(editDialog.estimatedUnitCost),
        expectedDate: editDialog.expectedDate || null,
        remarks: editDialog.remarks,
      });
      setEditDialog(initialEditDialog);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update reorder request.');
    }
  };

  const columns = [
    { field: 'partCode', headerName: 'Part Code', minWidth: 140, flex: 0.8 },
    { field: 'partName', headerName: 'Part Name', minWidth: 220, flex: 1.2 },
    { field: 'siteName', headerName: 'Site', minWidth: 180, flex: 0.9 },
    { field: 'vendorName', headerName: 'Vendor', minWidth: 180, flex: 0.9, valueGetter: ({ row }) => row.vendorName || 'Not selected' },
    { field: 'requestedQuantity', headerName: 'Qty', minWidth: 110, flex: 0.5 },
    { field: 'estimatedUnitCost', headerName: 'Unit Cost', minWidth: 120, flex: 0.6 },
    { field: 'estimatedTotalCost', headerName: 'Total Cost', minWidth: 130, flex: 0.7 },
    { field: 'status', headerName: 'Status', minWidth: 130, flex: 0.7 },
    { field: 'expectedDate', headerName: 'Expected', minWidth: 130, flex: 0.7 },
    {
      field: 'requestedAt',
      headerName: 'Requested At',
      minWidth: 180,
      flex: 0.9,
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleString() : '',
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 110,
      renderCell: ({ row }) => <Button size="small" onClick={() => openEditDialog(row)}>Update</Button>,
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Reorder Requests</Typography>
          <Typography variant="body2" color="text.secondary">Track low-stock purchase requests from requested to received.</Typography>
        </Box>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select label="Site" value={filters.siteId} onChange={(event) => setFilters((current) => ({ ...current, siteId: event.target.value }))} sx={{ minWidth: { xs: '100%', md: 240 } }}>
            <MenuItem value="">All Sites</MenuItem>
            {sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}
          </TextField>
          <TextField select label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} sx={{ minWidth: { xs: '100%', md: 200 } }}>
            <MenuItem value="">All Statuses</MenuItem>
            {statuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>
      <Paper sx={{ height: 620, borderRadius: 1 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>

      <Dialog open={editDialog.open} onClose={() => setEditDialog(initialEditDialog)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Reorder Request</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">{editDialog.row?.partCode} - {editDialog.row?.partName}</Typography>
          <TextField select label="Status" value={editDialog.status} onChange={(event) => setEditDialog((current) => ({ ...current, status: event.target.value }))}>
            {statuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
          </TextField>
          <TextField type="number" label="Requested Quantity" value={editDialog.requestedQuantity} onChange={(event) => setEditDialog((current) => ({ ...current, requestedQuantity: event.target.value }))} />
          <TextField type="number" label="Estimated Unit Cost" value={editDialog.estimatedUnitCost} onChange={(event) => setEditDialog((current) => ({ ...current, estimatedUnitCost: event.target.value }))} />
          <TextField type="date" label="Expected Date" value={editDialog.expectedDate} onChange={(event) => setEditDialog((current) => ({ ...current, expectedDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
          <TextField multiline minRows={2} label="Remarks" value={editDialog.remarks} onChange={(event) => setEditDialog((current) => ({ ...current, remarks: event.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(initialEditDialog)}>Cancel</Button>
          <Button variant="contained" onClick={submitEditDialog}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SparePartReorderPage;

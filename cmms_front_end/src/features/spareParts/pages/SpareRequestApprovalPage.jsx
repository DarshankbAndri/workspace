import React from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { getSpareRequests, managerApproveSpareRequest, managerRejectSpareRequest } from '../services/sparePartService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';

const initialDialog = { open: false, action: '', row: null, approvedQty: '', remarks: '' };

function SpareRequestApprovalPage() {
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [dialog, setDialog] = React.useState(initialDialog);

  const loadRows = React.useCallback(() => {
    setLoading(true);
    setError('');
    getSpareRequests({ status: 'REQUESTED' })
      .then((data) => setRows(data || []))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load spare requests.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadRows(); }, [loadRows]);

  const openDialog = (row, action) => {
    setDialog({ open: true, action, row, approvedQty: row.requestedQty ?? row.quantityUsed ?? '', remarks: '' });
  };

  const submitDialog = async () => {
    setError('');
    try {
      if (dialog.action === 'approve') {
        await managerApproveSpareRequest(dialog.row.id, {
          approvedQty: Number(dialog.approvedQty),
          remarks: dialog.remarks,
        });
      } else {
        await managerRejectSpareRequest(dialog.row.id, { remarks: dialog.remarks });
      }
      setDialog(initialDialog);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update spare request.');
    }
  };

  const columns = [
    { field: 'maintenanceRequestNumber', headerName: 'Request', minWidth: 150, flex: 0.7 },
    { field: 'assignmentId', headerName: 'Assignment', minWidth: 120, flex: 0.55 },
    { field: 'partCode', headerName: 'Part Code', minWidth: 140, flex: 0.7 },
    { field: 'partName', headerName: 'Part Name', minWidth: 220, flex: 1.1 },
    { field: 'siteName', headerName: 'Site', minWidth: 180, flex: 0.8 },
    { field: 'requestedQty', headerName: 'Requested Qty', minWidth: 130, flex: 0.6 },
    { field: 'availableStock', headerName: 'Available', minWidth: 120, flex: 0.55 },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 150,
      flex: 0.65,
      renderCell: ({ value }) => <Chip size="small" label={(value || '').replaceAll('_', ' ')} />,
    },
    { field: 'requestedByName', headerName: 'Requested By', minWidth: 150, flex: 0.75 },
    { field: 'remarks', headerName: 'Remarks', minWidth: 180, flex: 1 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 190,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          {hasPermission(PERMISSIONS.SPARE_USAGE_MANAGER_APPROVE) && <Button size="small" variant="contained" startIcon={<CheckCircle />} onClick={() => openDialog(row, 'approve')}>Approve</Button>}
          {hasPermission(PERMISSIONS.SPARE_USAGE_MANAGER_APPROVE) && <Button size="small" color="error" startIcon={<Cancel />} onClick={() => openDialog(row, 'reject')}>Reject</Button>}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>Spare Approval</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ height: 640, borderRadius: 1 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>

      <Dialog open={dialog.open} onClose={() => setDialog(initialDialog)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.action === 'approve' ? 'Approve Spare Request' : 'Reject Spare Request'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">{dialog.row?.partCode} - {dialog.row?.partName}</Typography>
          {dialog.action === 'approve' && (
            <TextField type="number" label="Approved Qty" value={dialog.approvedQty} onChange={(event) => setDialog((current) => ({ ...current, approvedQty: event.target.value }))} />
          )}
          <TextField multiline minRows={2} label="Remarks" value={dialog.remarks} onChange={(event) => setDialog((current) => ({ ...current, remarks: event.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(initialDialog)}>Cancel</Button>
          <Button variant="contained" color={dialog.action === 'reject' ? 'error' : 'primary'} onClick={submitDialog}>
            {dialog.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SpareRequestApprovalPage;

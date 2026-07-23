import React from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { CheckCircle, Inventory, ShoppingCart, TaskAlt, Undo } from '@mui/icons-material';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import {
  checkSpareRequestStock,
  consumeReturnSpareRequest,
  createPurchaseRequestFromSpare,
  getSpareRequests,
  issueSpareRequest,
  reserveSpareRequest,
} from '../services/sparePartService';

const statuses = ['', 'MANAGER_APPROVED', 'STOCK_AVAILABLE', 'STOCK_NOT_AVAILABLE', 'PURCHASE_REQUESTED', 'PURCHASE_RECEIVED', 'RESERVED', 'ISSUED', 'PARTIALLY_CONSUMED'];
const statusOptions = [
  { value: '', label: 'Open Store Requests' },
  ...statuses.filter(Boolean).map((status) => ({ value: status, label: status.replaceAll('_', ' ') })),
];
const initialConsumeDialog = { open: false, row: null, consumedQty: '', returnedQty: '', remarks: '' };
const statusColors = {
  MANAGER_APPROVED: 'info',
  STOCK_AVAILABLE: 'success',
  STOCK_NOT_AVAILABLE: 'warning',
  PURCHASE_REQUESTED: 'warning',
  PURCHASE_RECEIVED: 'success',
  RESERVED: 'info',
  ISSUED: 'primary',
  PARTIALLY_CONSUMED: 'warning',
  CONSUMED: 'success',
  RETURNED: 'default',
};

function SpareRequestStorePage() {
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [filters, setFilters] = React.useState({ status: '' });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [consumeDialog, setConsumeDialog] = React.useState(initialConsumeDialog);

  const loadRows = React.useCallback(() => {
    setLoading(true);
    setError('');
    getSpareRequests({ status: filters.status || undefined })
      .then((data) => setRows((data || []).filter((row) => !['REQUESTED', 'MANAGER_REJECTED', 'CANCELLED', 'CONSUMED', 'RETURNED'].includes(row.status))))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load spare requests.'))
      .finally(() => setLoading(false));
  }, [filters.status]);

  React.useEffect(() => { loadRows(); }, [loadRows]);

  const runAction = async (row, action) => {
    setError('');
    try {
      if (action === 'check') await checkSpareRequestStock(row.id);
      if (action === 'reserve') await reserveSpareRequest(row.id);
      if (action === 'issue') await issueSpareRequest(row.id);
      if (action === 'purchase') await createPurchaseRequestFromSpare(row.id);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process spare request.');
    }
  };

  const openConsumeDialog = (row) => {
    setConsumeDialog({
      open: true,
      row,
      consumedQty: row.consumedQty ?? '',
      returnedQty: row.returnedQty ?? '',
      remarks: row.remarks || '',
    });
  };

  const submitConsumeDialog = async () => {
    const consumedQty = Number(consumeDialog.consumedQty || 0);
    const returnedQty = Number(consumeDialog.returnedQty || 0);
    if (consumedQty + returnedQty > Number(consumeDialog.row.issuedQty || 0)) {
      setError('Consumed quantity plus returned quantity cannot exceed issued quantity.');
      return;
    }
    setError('');
    try {
      await consumeReturnSpareRequest(consumeDialog.row.id, {
        consumedQty,
        returnedQty,
        remarks: consumeDialog.remarks,
      });
      setConsumeDialog(initialConsumeDialog);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to record consume/return.');
    }
  };

  const columns = [
    { field: 'maintenanceRequestNumber', headerName: 'Request', minWidth: 150, flex: 0.7 },
    { field: 'assignmentId', headerName: 'Assignment', minWidth: 120, flex: 0.55 },
    { field: 'partCode', headerName: 'Part Code', minWidth: 140, flex: 0.7 },
    { field: 'partName', headerName: 'Part Name', minWidth: 220, flex: 1.1 },
    { field: 'approvedQty', headerName: 'Approved', minWidth: 110, flex: 0.5 },
    { field: 'issuedQty', headerName: 'Issued', minWidth: 100, flex: 0.45 },
    { field: 'consumedQty', headerName: 'Consumed', minWidth: 115, flex: 0.5 },
    { field: 'returnedQty', headerName: 'Returned', minWidth: 115, flex: 0.5 },
    { field: 'currentStock', headerName: 'Current', minWidth: 105, flex: 0.5 },
    { field: 'reservedStock', headerName: 'Reserved', minWidth: 110, flex: 0.5 },
    { field: 'availableStock', headerName: 'Available', minWidth: 110, flex: 0.5 },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 165,
      flex: 0.75,
      renderCell: ({ value }) => <Chip size="small" label={(value || '').replaceAll('_', ' ')} color={statusColors[value] || 'default'} />,
    },
    {
      field: 'purchaseRequestId',
      headerName: 'Purchase',
      minWidth: 130,
      flex: 0.6,
      valueGetter: ({ row }) => row.purchaseRequestId ? `#${row.purchaseRequestId} ${row.purchaseRequestStatus || ''}` : '',
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 420,
      renderCell: ({ row }) => {
        const status = row.status;
        return (
          <Stack direction="row" spacing={0.75}>
            {hasPermission(PERMISSIONS.SPARE_USAGE_STORE_PROCESS) && ['MANAGER_APPROVED', 'PURCHASE_RECEIVED', 'STOCK_AVAILABLE', 'STOCK_NOT_AVAILABLE'].includes(status) && (
              <Button size="small" startIcon={<TaskAlt />} onClick={() => runAction(row, 'check')}>Check</Button>
            )}
            {hasPermission(PERMISSIONS.SPARE_USAGE_RESERVE) && ['STOCK_AVAILABLE', 'PURCHASE_RECEIVED'].includes(status) && (
              <Button size="small" startIcon={<CheckCircle />} onClick={() => runAction(row, 'reserve')}>Reserve</Button>
            )}
            {hasPermission(PERMISSIONS.SPARE_USAGE_ISSUE) && ['STOCK_AVAILABLE', 'PURCHASE_RECEIVED', 'RESERVED'].includes(status) && (
              <Button size="small" variant="contained" startIcon={<Inventory />} onClick={() => runAction(row, 'issue')}>Issue</Button>
            )}
            {hasPermission(PERMISSIONS.REORDER_CREATE) && status === 'STOCK_NOT_AVAILABLE' && (
              <Button size="small" color="warning" startIcon={<ShoppingCart />} onClick={() => runAction(row, 'purchase')}>Purchase</Button>
            )}
            {hasPermission(PERMISSIONS.SPARE_USAGE_CONSUME) && ['ISSUED', 'PARTIALLY_CONSUMED'].includes(status) && (
              <Button size="small" color="success" startIcon={<Undo />} onClick={() => openConsumeDialog(row)}>Consume/Return</Button>
            )}
          </Stack>
        );
      },
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800}>Approved Spare Requests</Typography>
        <CommonDropdown size="small" label="Status" value={filters.status} options={statusOptions} onChange={(event) => setFilters({ status: event.target.value })} sx={{ minWidth: 240 }} />
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ height: 660, borderRadius: 1 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>

      <Dialog open={consumeDialog.open} onClose={() => setConsumeDialog(initialConsumeDialog)} maxWidth="sm" fullWidth>
        <DialogTitle>Consume/Return Spare</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">{consumeDialog.row?.partCode} - {consumeDialog.row?.partName}</Typography>
          <TextField label="Issued Qty" value={consumeDialog.row?.issuedQty ?? ''} InputProps={{ readOnly: true }} />
          <TextField type="number" label="Consumed Qty" value={consumeDialog.consumedQty} onChange={(event) => setConsumeDialog((current) => ({ ...current, consumedQty: event.target.value }))} />
          <TextField type="number" label="Returned Qty" value={consumeDialog.returnedQty} onChange={(event) => setConsumeDialog((current) => ({ ...current, returnedQty: event.target.value }))} />
          <TextField multiline minRows={2} label="Remarks" value={consumeDialog.remarks} onChange={(event) => setConsumeDialog((current) => ({ ...current, remarks: event.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConsumeDialog(initialConsumeDialog)}>Cancel</Button>
          <Button variant="contained" onClick={submitConsumeDialog}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SpareRequestStorePage;

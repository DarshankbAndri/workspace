import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  History,
  Inventory,
  QrCode2,
  ShoppingCart,
  SwapHoriz,
  Tune,
  UploadFile,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../../shared/utils/searchPayload';
import { getSites } from '../../site/services/siteService';
import {
  adjustStock,
  createReorderRequest,
  deleteSparePart,
  getSparePartTransactions,
  importSpareParts,
  searchSpareParts,
  stockIn,
  transferStock,
} from '../services/sparePartService';

const initialStockDialog = { open: false, mode: 'STOCK_IN', row: null, quantity: '', unitCost: '', remarks: '' };
const initialHistoryDialog = { open: false, row: null, rows: [], loading: false };
const initialTransferDialog = { open: false, row: null, targetSiteId: '', quantity: '', targetStorageLocation: '', remarks: '' };
const initialReorderDialog = { open: false, row: null, requestedQuantity: '', estimatedUnitCost: '', expectedDate: '', remarks: '' };
const initialImportDialog = { open: false, file: null, result: null, loading: false };
const initialLabelDialog = { open: false, row: null };

function SparePartListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [rowCount, setRowCount] = React.useState(0);
  const [sites, setSites] = React.useState([]);
  const [filters, setFilters] = React.useState({ search: '', siteId: '', lowStock: '' });
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([{ field: 'createdAt', sort: 'desc' }]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [stockDialog, setStockDialog] = React.useState(initialStockDialog);
  const [historyDialog, setHistoryDialog] = React.useState(initialHistoryDialog);
  const [transferDialog, setTransferDialog] = React.useState(initialTransferDialog);
  const [reorderDialog, setReorderDialog] = React.useState(initialReorderDialog);
  const [importDialog, setImportDialog] = React.useState(initialImportDialog);
  const [labelDialog, setLabelDialog] = React.useState(initialLabelDialog);

  const loadRows = React.useCallback(() => {
    setLoading(true);
    setError('');
    const payload = createSearchPayload({
      filters: [
        commonSearchFilter(filters.search),
        equalFilter('siteId', filters.siteId, 'LONG'),
        equalFilter('lowStock', filters.lowStock, 'BOOLEAN'),
      ],
      paginationModel,
      sortModel,
    });
    searchSpareParts(payload)
      .then((page) => {
        setRows(page.data || []);
        setRowCount(page.totalRecords || 0);
      })
      .catch(() => setError('Unable to load spare parts.'))
      .finally(() => setLoading(false));
  }, [filters, paginationModel, sortModel]);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    getSites().then((data) => setSites((data || []).filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  const updateFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const updatePaginationModel = (model) => {
    setPaginationModel((current) => ({
      page: model.pageSize !== current.pageSize ? 0 : model.page,
      pageSize: model.pageSize,
    }));
  };

  const openStockDialog = (row, mode) => {
    setStockDialog({
      open: true,
      mode,
      row,
      quantity: '',
      unitCost: row.unitCost ?? '',
      remarks: '',
    });
  };

  const openHistoryDialog = async (row) => {
    setHistoryDialog({ open: true, row, rows: [], loading: true });
    try {
      const data = await getSparePartTransactions(row.id);
      setHistoryDialog({ open: true, row, rows: data || [], loading: false });
    } catch (err) {
      setHistoryDialog(initialHistoryDialog);
      setError(err.response?.data?.message || 'Unable to load stock transaction history.');
    }
  };

  const openTransferDialog = (row) => {
    setTransferDialog({ ...initialTransferDialog, open: true, row, targetStorageLocation: row.storageLocation || '' });
  };

  const openReorderDialog = (row) => {
    const availableStock = row.availableStock ?? row.currentStock ?? 0;
    const shortage = Math.max(Number(row.minimumStock || 0) - Number(availableStock), 0);
    setReorderDialog({
      open: true,
      row,
      requestedQuantity: shortage || row.minimumStock || '',
      estimatedUnitCost: row.unitCost ?? '',
      expectedDate: '',
      remarks: row.lowStock ? 'Low stock reorder' : '',
    });
  };

  const closeStockDialog = () => setStockDialog(initialStockDialog);
  const closeTransferDialog = () => setTransferDialog(initialTransferDialog);
  const closeReorderDialog = () => setReorderDialog(initialReorderDialog);
  const closeImportDialog = () => setImportDialog(initialImportDialog);

  const submitStockDialog = async () => {
    setError('');
    try {
      const payload = {
        quantity: Number(stockDialog.quantity),
        unitCost: stockDialog.unitCost === '' ? null : Number(stockDialog.unitCost),
        remarks: stockDialog.remarks,
      };
      if (stockDialog.mode === 'STOCK_IN') {
        await stockIn(stockDialog.row.id, payload);
      } else {
        await adjustStock(stockDialog.row.id, payload);
      }
      closeStockDialog();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update stock.');
    }
  };

  const submitTransferDialog = async () => {
    setError('');
    try {
      await transferStock(transferDialog.row.id, {
        targetSiteId: Number(transferDialog.targetSiteId),
        quantity: Number(transferDialog.quantity),
        targetStorageLocation: transferDialog.targetStorageLocation,
        remarks: transferDialog.remarks,
      });
      closeTransferDialog();
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to transfer stock.');
    }
  };

  const submitReorderDialog = async () => {
    setError('');
    try {
      await createReorderRequest({
        stockId: reorderDialog.row.id,
        requestedQuantity: Number(reorderDialog.requestedQuantity),
        estimatedUnitCost: reorderDialog.estimatedUnitCost === '' ? null : Number(reorderDialog.estimatedUnitCost),
        expectedDate: reorderDialog.expectedDate || null,
        remarks: reorderDialog.remarks,
      });
      closeReorderDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create reorder request.');
    }
  };

  const submitImportDialog = async () => {
    if (!importDialog.file) {
      setError('Choose an Excel or CSV file to import.');
      return;
    }
    setError('');
    setImportDialog((current) => ({ ...current, loading: true, result: null }));
    try {
      const result = await importSpareParts(importDialog.file);
      setImportDialog((current) => ({ ...current, loading: false, result }));
      loadRows();
    } catch (err) {
      setImportDialog((current) => ({ ...current, loading: false }));
      setError(err.response?.data?.message || 'Unable to import spare parts.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this spare part stock record?')) return;
    try {
      await deleteSparePart(id);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to deactivate spare part.');
    }
  };

  const transactionColumns = [
    { field: 'transactionType', headerName: 'Type', minWidth: 150, flex: 0.8 },
    {
      field: 'businessDescription',
      headerName: 'Context',
      minWidth: 300,
      flex: 1.5,
      renderCell: ({ row }) => (
        <Stack spacing={0.25} sx={{ py: 0.5, minWidth: 0 }}>
          <Typography variant="body2" noWrap>{row.businessDescription || row.remarks || '-'}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.referenceCode || [row.referenceType, row.referenceId].filter(Boolean).join(' ') || ''}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'maintenanceRequestNumber',
      headerName: 'Request',
      minWidth: 160,
      flex: 0.8,
      renderCell: ({ row }) => (
        <Stack spacing={0.25} sx={{ py: 0.5, minWidth: 0 }}>
          <Typography variant="body2" noWrap>{row.maintenanceRequestNumber || '-'}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{row.maintenanceRequestTitle || ''}</Typography>
        </Stack>
      ),
    },
    {
      field: 'equipmentName',
      headerName: 'Equipment',
      minWidth: 190,
      flex: 1,
      renderCell: ({ row }) => (
        <Stack spacing={0.25} sx={{ py: 0.5, minWidth: 0 }}>
          <Typography variant="body2" noWrap>{row.equipmentName || '-'}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{row.equipmentCode || ''}</Typography>
        </Stack>
      ),
    },
    { field: 'quantity', headerName: 'Qty', minWidth: 100, flex: 0.5 },
    { field: 'stockBefore', headerName: 'Before', minWidth: 100, flex: 0.5 },
    { field: 'stockAfter', headerName: 'After', minWidth: 100, flex: 0.5 },
    { field: 'unitCost', headerName: 'Unit Cost', minWidth: 120, flex: 0.6 },
    { field: 'totalCost', headerName: 'Total Cost', minWidth: 130, flex: 0.7 },
    { field: 'assignedToName', headerName: 'Assigned To', minWidth: 150, flex: 0.8 },
    { field: 'createdByName', headerName: 'By', minWidth: 140, flex: 0.7 },
    { field: 'remarks', headerName: 'Remarks', minWidth: 200, flex: 1 },
    {
      field: 'transactionDate',
      headerName: 'Date',
      minWidth: 180,
      flex: 0.9,
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleString() : '',
    },
  ];

  const columns = [
    { field: 'partCode', headerName: 'Part Code', minWidth: 140, flex: 0.8 },
    { field: 'partName', headerName: 'Part Name', minWidth: 220, flex: 1.3 },
    { field: 'siteName', headerName: 'Site', minWidth: 170, flex: 0.9 },
    { field: 'category', headerName: 'Category', minWidth: 130, flex: 0.8 },
    { field: 'currentStock', headerName: 'Current', minWidth: 110, flex: 0.5 },
    { field: 'reservedStock', headerName: 'Reserved', minWidth: 110, flex: 0.5 },
    { field: 'availableStock', headerName: 'Available', minWidth: 120, flex: 0.55 },
    { field: 'minimumStock', headerName: 'Min', minWidth: 100, flex: 0.5 },
    { field: 'unit', headerName: 'Unit', minWidth: 90, flex: 0.4 },
    { field: 'unitCost', headerName: 'Unit Cost', minWidth: 120, flex: 0.6 },
    { field: 'storageLocation', headerName: 'Location', minWidth: 150, flex: 0.8 },
    {
      field: 'lowStock',
      headerName: 'Stock Status',
      minWidth: 130,
      flex: 0.7,
      valueFormatter: ({ value }) => value ? 'Low Stock' : 'OK',
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 300,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="History"><IconButton aria-label="History" onClick={() => openHistoryDialog(row)}><History fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Transfer"><IconButton aria-label="Transfer stock" onClick={() => openTransferDialog(row)}><SwapHoriz fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Reorder"><IconButton aria-label="Create reorder" onClick={() => openReorderDialog(row)}><ShoppingCart fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="QR label"><IconButton aria-label="QR label" onClick={() => setLabelDialog({ open: true, row })}><QrCode2 fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Stock in"><IconButton aria-label="Stock in" onClick={() => openStockDialog(row, 'STOCK_IN')}><Inventory fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Adjust"><IconButton aria-label="Adjust stock" onClick={() => openStockDialog(row, 'ADJUSTMENT')}><Tune fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton aria-label="Edit spare part" onClick={() => navigate(`/inventory/spare-parts/${row.id}/edit`)}><Edit fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton aria-label="Delete spare part" color="error" onClick={() => handleDelete(row.id)}><Delete fontSize="small" /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Spare Parts Inventory</Typography>
          <Typography variant="body2" color="text.secondary">Manage site-wise spare stock, transfers, reorders, and material cost.</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button variant="outlined" startIcon={<UploadFile />} onClick={() => setImportDialog({ ...initialImportDialog, open: true })}>Import</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/inventory/spare-parts/new')}>Add Spare Part</Button>
        </Stack>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Search" value={filters.search} onChange={updateFilter('search')} sx={{ minWidth: { xs: '100%', md: 260 } }} />
          <TextField select label="Site" value={filters.siteId} onChange={updateFilter('siteId')} sx={{ minWidth: { xs: '100%', md: 240 } }}>
            <MenuItem value="">All Sites</MenuItem>
            {sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}
          </TextField>
          <TextField select label="Stock Status" value={filters.lowStock} onChange={updateFilter('lowStock')} sx={{ minWidth: { xs: '100%', md: 180 } }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Low Stock</MenuItem>
            <MenuItem value="false">OK</MenuItem>
          </TextField>
        </Stack>
      </Paper>
      <Paper sx={{ height: 580, borderRadius: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
          paginationMode="server"
          sortingMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={updatePaginationModel}
          sortModel={sortModel}
          onSortModelChange={(model) => {
            setSortModel(model);
            setPaginationModel((current) => ({ ...current, page: 0 }));
          }}
        />
      </Paper>

      <Dialog open={stockDialog.open} onClose={closeStockDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{stockDialog.mode === 'STOCK_IN' ? 'Stock In' : 'Adjust Stock'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">{stockDialog.row?.partCode} - {stockDialog.row?.partName}</Typography>
          <TextField required type="number" label={stockDialog.mode === 'STOCK_IN' ? 'Quantity to Add' : 'New Stock Quantity'} value={stockDialog.quantity} onChange={(event) => setStockDialog((current) => ({ ...current, quantity: event.target.value }))} />
          <TextField type="number" label="Unit Cost" value={stockDialog.unitCost} onChange={(event) => setStockDialog((current) => ({ ...current, unitCost: event.target.value }))} />
          <TextField multiline minRows={2} label="Remarks" value={stockDialog.remarks} onChange={(event) => setStockDialog((current) => ({ ...current, remarks: event.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStockDialog}>Cancel</Button>
          <Button variant="contained" onClick={submitStockDialog}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={historyDialog.open} onClose={() => setHistoryDialog(initialHistoryDialog)} maxWidth="lg" fullWidth>
        <DialogTitle>Stock Transaction History</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{historyDialog.row?.partCode} - {historyDialog.row?.partName}</Typography>
          <Box sx={{ height: 430 }}>
            <DataGrid
              rows={historyDialog.rows}
              columns={transactionColumns}
              loading={historyDialog.loading}
              disableRowSelectionOnClick
              getRowHeight={() => 'auto'}
              pageSizeOptions={[5, 10, 25]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              sx={{ '& .MuiDataGrid-cell': { py: 1 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(initialHistoryDialog)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={transferDialog.open} onClose={closeTransferDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Site-to-Site Stock Transfer</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">{transferDialog.row?.siteName} available: {transferDialog.row?.availableStock ?? transferDialog.row?.currentStock} {transferDialog.row?.unit}</Typography>
          <TextField select required label="Target Site" value={transferDialog.targetSiteId} onChange={(event) => setTransferDialog((current) => ({ ...current, targetSiteId: event.target.value }))}>
            {sites.filter((site) => String(site.id) !== String(transferDialog.row?.siteId)).map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}
          </TextField>
          <TextField required type="number" label="Quantity" value={transferDialog.quantity} onChange={(event) => setTransferDialog((current) => ({ ...current, quantity: event.target.value }))} />
          <TextField label="Target Storage Location" value={transferDialog.targetStorageLocation} onChange={(event) => setTransferDialog((current) => ({ ...current, targetStorageLocation: event.target.value }))} />
          <TextField multiline minRows={2} label="Remarks" value={transferDialog.remarks} onChange={(event) => setTransferDialog((current) => ({ ...current, remarks: event.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTransferDialog}>Cancel</Button>
          <Button variant="contained" onClick={submitTransferDialog}>Transfer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reorderDialog.open} onClose={closeReorderDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create Reorder Request</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">{reorderDialog.row?.partCode} - {reorderDialog.row?.partName}</Typography>
          <TextField required type="number" label="Requested Quantity" value={reorderDialog.requestedQuantity} onChange={(event) => setReorderDialog((current) => ({ ...current, requestedQuantity: event.target.value }))} />
          <TextField type="number" label="Estimated Unit Cost" value={reorderDialog.estimatedUnitCost} onChange={(event) => setReorderDialog((current) => ({ ...current, estimatedUnitCost: event.target.value }))} />
          <TextField type="date" label="Expected Date" value={reorderDialog.expectedDate} onChange={(event) => setReorderDialog((current) => ({ ...current, expectedDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
          <TextField multiline minRows={2} label="Remarks" value={reorderDialog.remarks} onChange={(event) => setReorderDialog((current) => ({ ...current, remarks: event.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReorderDialog}>Cancel</Button>
          <Button variant="contained" onClick={submitReorderDialog}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importDialog.open} onClose={closeImportDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Import Spare Parts</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>
            Choose Excel or CSV
            <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={(event) => setImportDialog((current) => ({ ...current, file: event.target.files?.[0] || null, result: null }))} />
          </Button>
          <Typography variant="body2" color="text.secondary">{importDialog.file?.name || 'No file selected'}</Typography>
          <Typography variant="caption" color="text.secondary">
            Columns: partCode, partName, unit, siteId, currentStock, minimumStock, unitCost, category, description, storageLocation, preferredVendorId, status.
          </Typography>
          {importDialog.result && (
            <Alert severity={importDialog.result.failed ? 'warning' : 'success'}>
              Created {importDialog.result.created || 0}, updated {importDialog.result.updated || 0}, failed {importDialog.result.failed || 0}
              {(importDialog.result.errors || []).length > 0 && (
                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                  {importDialog.result.errors.slice(0, 5).map((item) => <li key={item}>{item}</li>)}
                </Box>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeImportDialog}>Close</Button>
          <Button variant="contained" disabled={importDialog.loading} onClick={submitImportDialog}>{importDialog.loading ? 'Importing...' : 'Import'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={labelDialog.open} onClose={() => setLabelDialog(initialLabelDialog)} maxWidth="xs" fullWidth>
        <DialogTitle>Spare Part QR Label</DialogTitle>
        <DialogContent>
          <Stack spacing={2} alignItems="center" sx={{ py: 1 }}>
            {labelDialog.row && <QRCodeSVG value={`CMMS-SPARE:${labelDialog.row.id}:${labelDialog.row.partCode}:${labelDialog.row.siteCode || ''}`} size={180} level="M" />}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={900}>{labelDialog.row?.partCode}</Typography>
              <Typography variant="body2" color="text.secondary">{labelDialog.row?.partName}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2">{labelDialog.row?.siteName}</Typography>
              <Typography variant="caption" color="text.secondary">{labelDialog.row?.storageLocation || 'No storage location'}</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => window.print()}>Print</Button>
          <Button onClick={() => setLabelDialog(initialLabelDialog)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SparePartListPage;

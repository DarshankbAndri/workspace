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
  GlobalStyles,
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
  History,
  QrCode2,
  ShoppingCart,
  SwapHoriz,
  UploadFile,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../../shared/utils/searchPayload';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import { getSites } from '../../site/services/siteService';
import {
  createReorderRequest,
  deleteSparePart,
  getSparePartTransactions,
  importSpareParts,
  searchSpareParts,
  transferStock,
} from '../services/sparePartService';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog';
import CommonList from '../../../shared/components/common/CommonList';

const initialHistoryDialog = { open: false, row: null, rows: [], loading: false };
const initialTransferDialog = { open: false, row: null, targetSiteId: '', quantity: '', targetStorageLocation: '', remarks: '' };
const initialReorderDialog = { open: false, row: null, requestedQuantity: '', estimatedUnitCost: '', expectedDate: '', remarks: '' };
const initialImportDialog = { open: false, file: null, result: null, loading: false };
const initialLabelDialog = { open: false, row: null };

const getSparePartViewPath = (row) => row?.id ? `/inventory/spare-parts/${row.id}/view` : '';

const getSparePartQrValue = (row) => {
  const path = getSparePartViewPath(row);
  if (!path) return '';
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
};

const formatStockValue = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 3 });
};

function SparePartListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [rowCount, setRowCount] = React.useState(0);
  const [sites, setSites] = React.useState([]);
  const [filters, setFilters] = React.useState({ search: '', siteId: '', lowStock: '' });
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([{ field: 'createdAt', sort: 'desc' }]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [historyDialog, setHistoryDialog] = React.useState(initialHistoryDialog);
  const [transferDialog, setTransferDialog] = React.useState(initialTransferDialog);
  const [reorderDialog, setReorderDialog] = React.useState(initialReorderDialog);
  const [importDialog, setImportDialog] = React.useState(initialImportDialog);
  const [labelDialog, setLabelDialog] = React.useState(initialLabelDialog);
  const [deleteRow, setDeleteRow] = React.useState(null);
  const labelQrValue = React.useMemo(() => getSparePartQrValue(labelDialog.row), [labelDialog.row]);

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

  const closeTransferDialog = () => setTransferDialog(initialTransferDialog);
  const closeReorderDialog = () => setReorderDialog(initialReorderDialog);
  const closeImportDialog = () => setImportDialog(initialImportDialog);

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

  const handleDelete = async () => {
    if (!deleteRow?.id) return;
    try {
      await deleteSparePart(deleteRow.id);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to deactivate spare part.');
    } finally {
      setDeleteRow(null);
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
      width: 340,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.25}>
          {hasPermission(PERMISSIONS.STOCK_TRANSACTION_VIEW) && <Tooltip title="History"><IconButton aria-label="History" onClick={(event) => { event.stopPropagation(); openHistoryDialog(row); }}><History fontSize="small" /></IconButton></Tooltip>}
          {hasPermission(PERMISSIONS.STOCK_TRANSACTION_CREATE) && <Tooltip title="Transfer"><IconButton aria-label="Transfer stock" onClick={(event) => { event.stopPropagation(); openTransferDialog(row); }}><SwapHoriz fontSize="small" /></IconButton></Tooltip>}
          {hasPermission(PERMISSIONS.REORDER_CREATE) && <Tooltip title="Reorder"><IconButton aria-label="Create reorder" onClick={(event) => { event.stopPropagation(); openReorderDialog(row); }}><ShoppingCart fontSize="small" /></IconButton></Tooltip>}
          <Tooltip title="QR label"><IconButton aria-label="QR label" onClick={(event) => { event.stopPropagation(); setLabelDialog({ open: true, row }); }}><QrCode2 fontSize="small" /></IconButton></Tooltip>
          {hasPermission(PERMISSIONS.SPARE_PART_DELETE) && <Tooltip title="Delete"><IconButton aria-label="Delete spare part" color="error" onClick={(event) => { event.stopPropagation(); setDeleteRow(row); }}><Delete fontSize="small" /></IconButton></Tooltip>}
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
          {hasPermission(PERMISSIONS.SPARE_PART_CREATE) && <Button variant="outlined" startIcon={<UploadFile />} onClick={() => setImportDialog({ ...initialImportDialog, open: true })}>Import</Button>}
          {hasPermission(PERMISSIONS.SPARE_PART_CREATE) && <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/inventory/spare-parts/new')}>Add Spare Part</Button>}
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
      <CommonList
        rows={rows}
        columns={columns}
        loading={loading}
        height={580}
        pageSizeOptions={[10, 25, 50, 100]}
        viewPermission={PERMISSIONS.SPARE_PART_VIEW}
        getRowViewPath={getSparePartViewPath}
        dataGridProps={{
          paginationMode: 'server',
          sortingMode: 'server',
          rowCount,
          paginationModel,
          onPaginationModelChange: updatePaginationModel,
          sortModel,
          onSortModelChange: (model) => {
            setSortModel(model);
            setPaginationModel((current) => ({ ...current, page: 0 }));
          },
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteRow)}
        handleClose={() => setDeleteRow(null)}
        title="Deactivate spare part?"
        message={deleteRow ? `${deleteRow.partCode || 'This spare part'} will be deactivated.` : 'This spare part stock record will be deactivated.'}
        handleAgree={handleDelete}
        closebtn="Cancel"
        agreebtn="Deactivate"
      />
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

      <Dialog
        open={labelDialog.open}
        onClose={() => setLabelDialog(initialLabelDialog)}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{
          sx: {
            mx: 2,
            width: 'min(360px, calc(100vw - 32px))',
          },
        }}
      >
        <GlobalStyles
          styles={{
            '@media print': {
              'body *': { visibility: 'hidden' },
              '.spare-qr-print-area, .spare-qr-print-area *': { visibility: 'visible' },
              '.spare-qr-print-area': {
                background: '#fff',
                color: '#000',
                left: 0,
                padding: '6mm',
                position: 'fixed',
                top: 0,
                width: '72mm',
              },
            },
          }}
        />
        <DialogTitle>Spare Part QR Label</DialogTitle>
        <DialogContent>
          <Stack
            className="spare-qr-print-area"
            spacing={1.5}
            alignItems="center"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              color: 'text.primary',
              mx: 'auto',
              p: 2,
              width: 280,
            }}
          >
            <Typography variant="overline" fontWeight={900} sx={{ lineHeight: 1 }}>CMMS Spare Part</Typography>
            {labelDialog.row && labelQrValue && (
              <QRCodeSVG
                value={labelQrValue}
                size={190}
                level="H"
                marginSize={2}
                title={`Open ${labelDialog.row.partCode || 'spare part'} in CMMS`}
              />
            )}
            <Box sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant="h6" fontWeight={900} sx={{ overflowWrap: 'anywhere' }}>{labelDialog.row?.partCode}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{labelDialog.row?.partName}</Typography>
              <Divider sx={{ my: 1.25 }} />
              <Stack spacing={0.75} sx={{ textAlign: 'left' }}>
                <Typography variant="caption"><strong>Site:</strong> {labelDialog.row?.siteName || '-'}</Typography>
                <Typography variant="caption"><strong>Location:</strong> {labelDialog.row?.storageLocation || 'Not assigned'}</Typography>
                <Typography variant="caption">
                  <strong>Stock:</strong> {formatStockValue(labelDialog.row?.availableStock)} available / {formatStockValue(labelDialog.row?.currentStock)} current {labelDialog.row?.unit || ''}
                </Typography>
                <Typography variant="caption"><strong>Min:</strong> {formatStockValue(labelDialog.row?.minimumStock)} {labelDialog.row?.lowStock ? '(Low stock)' : ''}</Typography>
              </Stack>
              <Divider sx={{ my: 1.25 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>
                {labelQrValue}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          {labelDialog.row && <Button onClick={() => navigate(getSparePartViewPath(labelDialog.row))}>Open</Button>}
          <Button onClick={() => window.print()}>Print</Button>
          <Button onClick={() => setLabelDialog(initialLabelDialog)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SparePartListPage;

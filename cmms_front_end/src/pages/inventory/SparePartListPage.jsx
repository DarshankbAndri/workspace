import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit, Inventory, Tune } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../utils/searchPayload';
import { getSites } from '../../services/siteService';
import { adjustStock, deleteSparePart, searchSpareParts, stockIn } from '../../services/sparePartService';

const initialStockDialog = { open: false, mode: 'STOCK_IN', row: null, quantity: '', unitCost: '', remarks: '' };

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

  const closeStockDialog = () => setStockDialog(initialStockDialog);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this spare part stock record?')) return;
    try {
      await deleteSparePart(id);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to deactivate spare part.');
    }
  };

  const columns = [
    { field: 'partCode', headerName: 'Part Code', minWidth: 140, flex: 0.8 },
    { field: 'partName', headerName: 'Part Name', minWidth: 220, flex: 1.3 },
    { field: 'siteName', headerName: 'Site', minWidth: 170, flex: 0.9 },
    { field: 'category', headerName: 'Category', minWidth: 130, flex: 0.8 },
    { field: 'currentStock', headerName: 'Stock', minWidth: 110, flex: 0.5 },
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
      width: 180,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton aria-label="Stock in" onClick={() => openStockDialog(row, 'STOCK_IN')}><Inventory fontSize="small" /></IconButton>
          <IconButton aria-label="Adjust stock" onClick={() => openStockDialog(row, 'ADJUSTMENT')}><Tune fontSize="small" /></IconButton>
          <IconButton aria-label="Edit spare part" onClick={() => navigate(`/inventory/spare-parts/${row.id}/edit`)}><Edit fontSize="small" /></IconButton>
          <IconButton aria-label="Delete spare part" color="error" onClick={() => handleDelete(row.id)}><Delete fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Spare Parts Inventory</Typography>
          <Typography variant="body2" color="text.secondary">Manage site-wise spare stock, minimum levels, and material cost.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/inventory/spare-parts/new')}>Add Spare Part</Button>
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
          <Typography variant="body2" color="text.secondary">
            {stockDialog.row?.partCode} - {stockDialog.row?.partName}
          </Typography>
          <TextField
            required
            type="number"
            label={stockDialog.mode === 'STOCK_IN' ? 'Quantity to Add' : 'New Stock Quantity'}
            value={stockDialog.quantity}
            onChange={(event) => setStockDialog((current) => ({ ...current, quantity: event.target.value }))}
          />
          <TextField type="number" label="Unit Cost" value={stockDialog.unitCost} onChange={(event) => setStockDialog((current) => ({ ...current, unitCost: event.target.value }))} />
          <TextField multiline minRows={2} label="Remarks" value={stockDialog.remarks} onChange={(event) => setStockDialog((current) => ({ ...current, remarks: event.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStockDialog}>Cancel</Button>
          <Button variant="contained" onClick={submitStockDialog}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SparePartListPage;

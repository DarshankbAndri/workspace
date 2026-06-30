import React from 'react';
import { Box, Button, IconButton, MenuItem, Paper, Stack, TextField, Typography, Alert } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { deleteVendor, getVendors, searchVendors } from '../services/vendorService';
import { getSites } from '../../site/services/siteService';
import { createSearchPayload, equalFilter } from '../../../shared/utils/searchPayload';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';

function VendorListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [siteFilter, setSiteFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ACTIVE');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [rowCount, setRowCount] = React.useState(0);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([]);

  const loadRows = React.useCallback(() => {
    setLoading(true);
    const payload = createSearchPayload({
      filters: [
        equalFilter('siteId', siteFilter, 'NUMBER'),
        equalFilter('active', statusFilter ? statusFilter === 'ACTIVE' : '', 'BOOLEAN'),
      ],
      paginationModel,
      sortModel,
    });
    searchVendors(payload)
      .then((response) => {
        setRows(response.data || []);
        setRowCount(response.totalRecords || 0);
      })
      .catch(() => setError('Unable to load vendors.'))
      .finally(() => setLoading(false));
  }, [paginationModel, siteFilter, sortModel, statusFilter]);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    getSites().then((data) => setSites(data.filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    await deleteVendor(id);
    loadRows();
  };

  const resetPage = () => setPaginationModel((current) => ({ ...current, page: 0 }));

  const columns = [
    { field: 'vendorCode', headerName: 'Code', minWidth: 120, flex: 0.7 },
    { field: 'vendorName', headerName: 'Vendor', minWidth: 200, flex: 1.2 },
    { field: 'contactPerson', headerName: 'Contact', minWidth: 160, flex: 0.9 },
    { field: 'email', headerName: 'Email', minWidth: 200, flex: 1 },
    { field: 'phone', headerName: 'Phone', minWidth: 140, flex: 0.8 },
    { field: 'serviceCategory', headerName: 'Category', minWidth: 140, flex: 0.8 },
    { field: 'assignedSiteCount', headerName: 'Sites', minWidth: 90, flex: 0.5 },
    { field: 'primarySiteName', headerName: 'Primary Site', minWidth: 180, flex: 1 },
    { field: 'siteNames', headerName: 'Assigned Sites', minWidth: 220, flex: 1.2 },
    { field: 'active', headerName: 'Active', minWidth: 90, flex: 0.5, valueFormatter: ({ value }) => (value ? 'Yes' : 'No') },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 110,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          {hasPermission(PERMISSIONS.VENDOR_UPDATE) && <IconButton aria-label="Edit vendor" onClick={() => navigate(`/vendors/${row.id}`)}><Edit fontSize="small" /></IconButton>}
          {hasPermission(PERMISSIONS.VENDOR_DELETE) && <IconButton aria-label="Delete vendor" color="error" onClick={() => handleDelete(row.id)}><Delete fontSize="small" /></IconButton>}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Vendors</Typography>
          <Typography variant="body2" color="text.secondary">Maintain maintenance partners and service categories.</Typography>
        </Box>
        {hasPermission(PERMISSIONS.VENDOR_CREATE) && <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/vendors/new')}>Add Vendor</Button>}
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField select label="Site" value={siteFilter} onChange={(event) => { setSiteFilter(event.target.value); resetPage(); }} sx={{ minWidth: 240 }}>
            <MenuItem value="">All Sites</MenuItem>
            {sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}
          </TextField>
          <TextField select label="Status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); resetPage(); }} sx={{ minWidth: 180 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          </TextField>
        </Stack>
      </Paper>
      <Paper sx={{ height: 560, borderRadius: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          paginationMode="server"
          sortingMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => setPaginationModel((current) => (model.pageSize !== current.pageSize ? { ...model, page: 0 } : model))}
          sortModel={sortModel}
          onSortModelChange={(model) => { setSortModel(model); resetPage(); }}
        />
      </Paper>
    </Box>
  );
}

export default VendorListPage;

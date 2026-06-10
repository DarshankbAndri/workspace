import React from 'react';
import { Box, Button, IconButton, Paper, Stack, Typography, Alert } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { deleteVendor, getVendors } from '../../services/vendorService';

function VendorListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadRows = React.useCallback(() => {
    setLoading(true);
    getVendors()
      .then(setRows)
      .catch(() => setError('Unable to load vendors.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadRows(); }, [loadRows]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    await deleteVendor(id);
    loadRows();
  };

  const columns = [
    { field: 'vendorCode', headerName: 'Code', minWidth: 120, flex: 0.7 },
    { field: 'vendorName', headerName: 'Vendor', minWidth: 200, flex: 1.2 },
    { field: 'contactPerson', headerName: 'Contact', minWidth: 160, flex: 0.9 },
    { field: 'email', headerName: 'Email', minWidth: 200, flex: 1 },
    { field: 'phone', headerName: 'Phone', minWidth: 140, flex: 0.8 },
    { field: 'serviceCategory', headerName: 'Category', minWidth: 140, flex: 0.8 },
    { field: 'active', headerName: 'Active', minWidth: 90, flex: 0.5, valueFormatter: ({ value }) => (value ? 'Yes' : 'No') },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 110,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton aria-label="Edit vendor" onClick={() => navigate(`/vendors/${row.id}`)}><Edit fontSize="small" /></IconButton>
          <IconButton aria-label="Delete vendor" color="error" onClick={() => handleDelete(row.id)}><Delete fontSize="small" /></IconButton>
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
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/vendors/new')}>Add Vendor</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ height: 560, borderRadius: 1 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>
    </Box>
  );
}

export default VendorListPage;

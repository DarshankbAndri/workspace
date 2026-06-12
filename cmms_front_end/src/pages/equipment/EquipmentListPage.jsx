import React from 'react';
import { Box, Button, IconButton, MenuItem, Paper, Stack, TextField, Typography, Alert } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { deleteEquipment, getEquipments } from '../../services/equipmentService';
import { getSites } from '../../services/siteService';

function EquipmentListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [siteFilter, setSiteFilter] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadRows = React.useCallback(() => {
    setLoading(true);
    getEquipments(siteFilter || undefined)
      .then(setRows)
      .catch(() => setError('Unable to load equipment.'))
      .finally(() => setLoading(false));
  }, [siteFilter]);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    getSites().then((data) => setSites(data.filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this equipment?')) return;
    await deleteEquipment(id);
    loadRows();
  };

  const columns = [
    { field: 'equipmentCode', headerName: 'Code', minWidth: 120, flex: 0.7 },
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 180, flex: 1.2 },
    { field: 'siteName', headerName: 'Site', minWidth: 180, flex: 1 },
    { field: 'category', headerName: 'Category', minWidth: 120, flex: 0.8 },
    { field: 'location', headerName: 'Location', minWidth: 130, flex: 0.8 },
    { field: 'status', headerName: 'Status', minWidth: 110, flex: 0.6 },
    { field: 'criticality', headerName: 'Criticality', minWidth: 120, flex: 0.7 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 110,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton aria-label="Edit equipment" onClick={() => navigate(`/equipment/${row.id}`)}><Edit fontSize="small" /></IconButton>
          <IconButton aria-label="Delete equipment" color="error" onClick={() => handleDelete(row.id)}><Delete fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Equipment</Typography>
          <Typography variant="body2" color="text.secondary">Maintain plant assets and operating status.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/equipment/new')}>Add Equipment</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <TextField select label="Site" value={siteFilter} onChange={(event) => setSiteFilter(event.target.value)} sx={{ minWidth: { xs: '100%', sm: 280 } }}>
          <MenuItem value="">All Sites</MenuItem>
          {sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}
        </TextField>
      </Paper>
      <Paper sx={{ height: 560, borderRadius: 1 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>
    </Box>
  );
}

export default EquipmentListPage;

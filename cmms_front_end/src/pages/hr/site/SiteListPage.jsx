import React from 'react';
import { Alert, Box, Button, Chip, IconButton, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { Add, Delete, Edit, Visibility } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { deleteSite, getSites } from '../../../services/siteService';

function SiteListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('ACTIVE');
  const [deleteId, setDeleteId] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState('');

  const loadRows = React.useCallback(() => {
    setLoading(true);
    getSites()
      .then(setRows)
      .catch(() => setError('Unable to load sites.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadRows(); }, [loadRows]);

  const filteredRows = rows.filter((row) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [row.siteName, row.siteCode, row.city].some((value) => (value || '').toLowerCase().includes(query));
    const matchesStatus = !status || row.status === status;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    try {
      await deleteSite(deleteId);
      setSnackbar('Site marked inactive.');
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to mark site inactive.');
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    { field: 'siteCode', headerName: 'Code', minWidth: 120, flex: 0.7 },
    { field: 'siteName', headerName: 'Site', minWidth: 200, flex: 1.2 },
    { field: 'organizationName', headerName: 'Organization', minWidth: 190, flex: 1 },
    { field: 'siteType', headerName: 'Type', minWidth: 130, flex: 0.7 },
    { field: 'city', headerName: 'City', minWidth: 130, flex: 0.7 },
    { field: 'state', headerName: 'State', minWidth: 130, flex: 0.7 },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 110,
      flex: 0.5,
      renderCell: ({ value }) => <Chip size="small" label={value || 'ACTIVE'} color={value === 'INACTIVE' ? 'default' : 'success'} />,
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 150,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton aria-label="View site" onClick={() => navigate(`/hr/sites/${row.id}/edit`, { state: { viewOnly: true } })}><Visibility fontSize="small" /></IconButton>
          <IconButton aria-label="Edit site" onClick={() => navigate(`/hr/sites/${row.id}/edit`)}><Edit fontSize="small" /></IconButton>
          <IconButton aria-label="Mark site inactive" color="error" onClick={() => setDeleteId(row.id)}><Delete fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Sites</Typography>
          <Typography variant="body2" color="text.secondary">Manage organization sites and plant contact details.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/hr/sites/new')}>Add Site</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth label="Search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Site name, code, or city" />
          <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 180 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          </TextField>
        </Stack>
      </Paper>
      <Paper sx={{ height: 560, borderRadius: 1 }}>
        <DataGrid rows={filteredRows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>
      <ConfirmDialog open={Boolean(deleteId)} handleClose={() => setDeleteId(null)} title="Mark site inactive?" message="This site will be marked inactive." handleAgree={handleDelete} closebtn="Cancel" agreebtn="Mark inactive" />
      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} message={snackbar} onClose={() => setSnackbar('')} />
    </Box>
  );
}

export default SiteListPage;

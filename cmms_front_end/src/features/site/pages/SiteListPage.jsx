import React from 'react';
import { Alert, Box, Button, Chip, IconButton, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog';
import CommonList from '../../../shared/components/common/CommonList';
import CommonStatusDropdown from '../../../shared/components/common/CommonStatusDropdown';
import { deleteSite, searchSites } from '../services/siteService';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../../shared/utils/searchPayload';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';

function SiteListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('ACTIVE');
  const [rowCount, setRowCount] = React.useState(0);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([]);
  const [deleteId, setDeleteId] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState('');

  const loadRows = React.useCallback(() => {
    setLoading(true);
    const payload = createSearchPayload({
      filters: [
        commonSearchFilter(search),
        equalFilter('status', status),
      ],
      paginationModel,
      sortModel,
    });
    searchSites(payload)
      .then((response) => {
        setRows(response.data || []);
        setRowCount(response.totalRecords || 0);
      })
      .catch(() => setError('Unable to load sites.'))
      .finally(() => setLoading(false));
  }, [paginationModel, search, sortModel, status]);

  React.useEffect(() => { loadRows(); }, [loadRows]);

  const resetPage = () => setPaginationModel((current) => ({ ...current, page: 0 }));

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
          {hasPermission(PERMISSIONS.SITE_DELETE) && (
            <IconButton
              aria-label="Mark site inactive"
              color="error"
              onClick={(event) => {
                event.stopPropagation();
                setDeleteId(row.id);
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
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
        {hasPermission(PERMISSIONS.SITE_CREATE) && <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/hr/sites/new')}>Add Site</Button>}
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth label="Search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Site name, code, or city" />
          <CommonStatusDropdown value={status} onChange={(event) => { setStatus(event.target.value); resetPage(); }} sx={{ minWidth: 180 }} />
        </Stack>
      </Paper>
      <CommonList
        rows={rows}
        columns={columns}
        loading={loading}
        viewPermission={PERMISSIONS.SITE_VIEW}
        getRowViewPath={(row) => `/hr/sites/${row.id}/view`}
        dataGridProps={{
          paginationMode: 'server',
          sortingMode: 'server',
          rowCount,
          paginationModel,
          onPaginationModelChange: (model) => setPaginationModel((current) => (model.pageSize !== current.pageSize ? { ...model, page: 0 } : model)),
          sortModel,
          onSortModelChange: (model) => { setSortModel(model); resetPage(); },
        }}
      />
      <ConfirmDialog open={Boolean(deleteId)} handleClose={() => setDeleteId(null)} title="Mark site inactive?" message="This site will be marked inactive." handleAgree={handleDelete} closebtn="Cancel" agreebtn="Mark inactive" />
      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} message={snackbar} onClose={() => setSnackbar('')} />
    </Box>
  );
}

export default SiteListPage;

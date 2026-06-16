import React from 'react';
import { Alert, Box, Button, Chip, IconButton, MenuItem, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Add, Delete, Edit, Visibility } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { deleteRole, searchRoles } from '../../../services/roleService';
import { useAuth } from '../../../context/AuthContext';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../../utils/searchPayload';

function RoleListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [roles, setRoles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [rowCount, setRowCount] = React.useState(0);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([]);

  const loadRoles = React.useCallback(() => {
    setLoading(true);
    const payload = createSearchPayload({
      filters: [
        commonSearchFilter(search),
        equalFilter('status', status),
      ],
      paginationModel,
      sortModel,
    });
    searchRoles(payload)
      .then((response) => {
        setRoles(response.data || []);
        setRowCount(response.totalRecords || 0);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load roles'))
      .finally(() => setLoading(false));
  }, [paginationModel, search, sortModel, status]);

  React.useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleDelete = async (role) => {
    if (!window.confirm(`Inactivate role ${role.roleCode}?`)) return;
    try {
      await deleteRole(role.id);
      loadRoles();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to inactivate role');
    }
  };

  const resetPage = () => setPaginationModel((current) => ({ ...current, page: 0 }));

  const columns = [
    { field: 'roleCode', headerName: 'Role Code', flex: 1, minWidth: 150 },
    { field: 'roleName', headerName: 'Role Name', flex: 1, minWidth: 180 },
    { field: 'description', headerName: 'Description', flex: 1.3, minWidth: 220 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: ({ row }) => <Chip size="small" color={row.status === 'ACTIVE' ? 'success' : 'default'} label={row.status} />,
    },
    { field: 'permissionCount', headerName: 'Permission Count', width: 150, valueGetter: ({ row }) => row.permissionCount ?? (row.permissions || []).length },
    { field: 'createdAt', headerName: 'Created At', width: 180, valueFormatter: ({ value }) => value ? new Date(value).toLocaleString() : '' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          {hasPermission('ROLE_VIEW') && <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/admin/roles/${row.id}/view`)}><Visibility fontSize="small" /></IconButton></Tooltip>}
          {hasPermission('ROLE_UPDATE') && <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/admin/roles/${row.id}/edit`)}><Edit fontSize="small" /></IconButton></Tooltip>}
          {hasPermission('ROLE_DELETE') && <Tooltip title="Inactivate"><IconButton size="small" color="error" onClick={() => handleDelete(row)}><Delete fontSize="small" /></IconButton></Tooltip>}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h4">Roles</Typography>
        {hasPermission('ROLE_CREATE') && <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/admin/roles/new')}>Add Role</Button>}
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ p: 2, borderRadius: 1, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} fullWidth />
          <TextField select label="Status" value={status} onChange={(event) => { setStatus(event.target.value); resetPage(); }} sx={{ minWidth: 180 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          </TextField>
        </Stack>
      </Paper>
      <Paper sx={{ height: 560, borderRadius: 1 }}>
        <DataGrid
          rows={roles}
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

export default RoleListPage;

import React from 'react';
import { Alert, Box, Button, Chip, IconButton, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { Add, Delete, Edit, Visibility } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog';
import { deleteEmployee, searchEmployees } from '../services/employeeService';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../../shared/utils/searchPayload';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';

function EmployeeListPage() {
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
    searchEmployees(payload)
      .then((response) => {
        setRows(response.data || []);
        setRowCount(response.totalRecords || 0);
      })
      .catch(() => setError('Unable to load employees.'))
      .finally(() => setLoading(false));
  }, [paginationModel, search, sortModel, status]);

  React.useEffect(() => { loadRows(); }, [loadRows]);

  const resetPage = () => setPaginationModel((current) => ({ ...current, page: 0 }));

  const handleDelete = async () => {
    try {
      await deleteEmployee(deleteId);
      setSnackbar('Employee marked inactive.');
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to mark employee inactive.');
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    { field: 'employeeCode', headerName: 'Code', minWidth: 120, flex: 0.7 },
    { field: 'firstName', headerName: 'First Name', minWidth: 140, flex: 0.8 },
    { field: 'lastName', headerName: 'Last Name', minWidth: 140, flex: 0.8 },
    { field: 'mobileNumber', headerName: 'Mobile', minWidth: 140, flex: 0.8 },
    { field: 'email', headerName: 'Email', minWidth: 200, flex: 1 },
    { field: 'designation', headerName: 'Designation', minWidth: 150, flex: 0.8 },
    { field: 'department', headerName: 'Department', minWidth: 140, flex: 0.7 },
    { field: 'assignedSiteCount', headerName: 'Sites', minWidth: 90, flex: 0.4 },
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
          {hasPermission(PERMISSIONS.EMPLOYEE_VIEW) && <IconButton aria-label="View employee" onClick={() => navigate(`/hr/employees/${row.id}/view`)}><Visibility fontSize="small" /></IconButton>}
          {hasPermission(PERMISSIONS.EMPLOYEE_UPDATE) && <IconButton aria-label="Edit employee" onClick={() => navigate(`/hr/employees/${row.id}/edit`)}><Edit fontSize="small" /></IconButton>}
          {hasPermission(PERMISSIONS.EMPLOYEE_DELETE) && <IconButton aria-label="Mark employee inactive" color="error" onClick={() => setDeleteId(row.id)}><Delete fontSize="small" /></IconButton>}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Employees</Typography>
          <Typography variant="body2" color="text.secondary">Maintain employees and site-wise execution roles.</Typography>
        </Box>
        {hasPermission(PERMISSIONS.EMPLOYEE_CREATE) && <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/hr/employees/new')}>Add Employee</Button>}
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth label="Search" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Name, code, mobile, or email" />
          <TextField select label="Status" value={status} onChange={(event) => { setStatus(event.target.value); resetPage(); }} sx={{ minWidth: 180 }}>
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
      <ConfirmDialog open={Boolean(deleteId)} handleClose={() => setDeleteId(null)} title="Mark employee inactive?" message="This employee and active assignments will be marked inactive." handleAgree={handleDelete} closebtn="Cancel" agreebtn="Mark inactive" />
      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} message={snackbar} onClose={() => setSnackbar('')} />
    </Box>
  );
}

export default EmployeeListPage;

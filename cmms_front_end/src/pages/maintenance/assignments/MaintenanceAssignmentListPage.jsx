import React from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, MenuItem, Paper, Snackbar, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Add, Delete, Edit, Visibility } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { deleteMaintenanceAssignment, searchMaintenanceAssignments } from '../../../services/maintenanceService';
import { getSites } from '../../../services/siteService';
import { getVendors } from '../../../services/vendorService';
import { useAuth } from '../../../context/AuthContext';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../../utils/searchPayload';

function MaintenanceAssignmentListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
  const [filters, setFilters] = React.useState({ siteId: '', requestStatus: '', vendorId: '', status: '', search: '' });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [deleteRow, setDeleteRow] = React.useState(null);
  const [rowCount, setRowCount] = React.useState(0);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([]);

  const loadRows = React.useCallback(() => {
    setLoading(true);
    const payload = createSearchPayload({
      filters: [
        equalFilter('siteId', filters.siteId, 'NUMBER'),
        equalFilter('requestStatus', filters.requestStatus),
        equalFilter('vendorId', filters.vendorId, 'NUMBER'),
        equalFilter('status', filters.status),
        commonSearchFilter(filters.search),
      ],
      paginationModel,
      sortModel,
    });
    searchMaintenanceAssignments(payload)
      .then((response) => {
        setRows(response.data || []);
        setRowCount(response.totalRecords || 0);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load assignments.'))
      .finally(() => setLoading(false));
  }, [filters, paginationModel, sortModel]);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    Promise.all([getSites(), getVendors({ status: 'ACTIVE' })])
      .then(([siteRows, vendorRows]) => {
        setSites((siteRows || []).filter((site) => site.status !== 'INACTIVE'));
        setVendors(vendorRows || []);
      })
      .catch(() => setError('Unable to load filters.'));
  }, []);

  const resetPage = () => setPaginationModel((current) => ({ ...current, page: 0 }));

  const updateFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
    resetPage();
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    try {
      await deleteMaintenanceAssignment(deleteRow.id);
      setSuccess('Assignment deleted.');
      setDeleteRow(null);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete assignment.');
    }
  };

  const columns = [
    { field: 'siteName', headerName: 'Site', minWidth: 170, flex: 0.8 },
    { field: 'requestNumber', headerName: 'Request No.', minWidth: 170, flex: 0.9 },
    { field: 'requestTitle', headerName: 'Request', minWidth: 220, flex: 1.2 },
    { field: 'assignedTo', headerName: 'Assigned To', minWidth: 150, flex: 0.8 },
    { field: 'vendorName', headerName: 'Vendor', minWidth: 180, flex: 1 },
    { field: 'assignedDate', headerName: 'Assigned', minWidth: 120, flex: 0.7 },
    { field: 'status', headerName: 'Status', minWidth: 130, flex: 0.7 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 140,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          {hasPermission('ASSIGNMENT_VIEW') && <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/maintenance/assignments/${row.id}/view`)}><Visibility fontSize="small" /></IconButton></Tooltip>}
          {hasPermission('ASSIGNMENT_UPDATE') && <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/maintenance/assignments/${row.id}/edit`)}><Edit fontSize="small" /></IconButton></Tooltip>}
          {hasPermission('ASSIGNMENT_DELETE') && <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteRow(row)}><Delete fontSize="small" /></IconButton></Tooltip>}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Maintenance Assignments</Typography>
          <Typography variant="body2" color="text.secondary">Assign work orders to technicians or vendors and track progress.</Typography>
        </Box>
        {hasPermission('ASSIGNMENT_CREATE') && <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/maintenance/assignments/new')}>Add Assignment</Button>}
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select label="Site" value={filters.siteId} onChange={updateFilter('siteId')} sx={{ minWidth: 220 }}>
            <MenuItem value="">All Sites</MenuItem>
            {sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}
          </TextField>
          <TextField select label="Request Status" value={filters.requestStatus} onChange={updateFilter('requestStatus')} sx={{ minWidth: 180 }}>
            <MenuItem value="">All Requests</MenuItem>
            <MenuItem value="OPEN">Open</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="ON_HOLD">On Hold</MenuItem>
            <MenuItem value="CLOSED">Closed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>
          <TextField select label="Vendor" value={filters.vendorId} onChange={updateFilter('vendorId')} sx={{ minWidth: 220 }}>
            <MenuItem value="">All Vendors</MenuItem>
            {vendors.map((vendor) => <MenuItem key={vendor.id} value={vendor.id}>{vendor.vendorName}</MenuItem>)}
          </TextField>
          <TextField select label="Assignment Status" value={filters.status} onChange={updateFilter('status')} sx={{ minWidth: 180 }}>
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="ASSIGNED">Assigned</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>
          <TextField label="Search" value={filters.search} onChange={updateFilter('search')} fullWidth />
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
      <Dialog open={Boolean(deleteRow)} onClose={() => setDeleteRow(null)}>
        <DialogTitle>Delete assignment?</DialogTitle>
        <DialogContent><DialogContentText>This will delete assignment for {deleteRow?.requestNumber || deleteRow?.requestTitle}.</DialogContentText></DialogContent>
        <DialogActions><Button onClick={() => setDeleteRow(null)}>Cancel</Button><Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button></DialogActions>
      </Dialog>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess('')} message={success} />
    </Box>
  );
}

export default MaintenanceAssignmentListPage;

import React from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, Snackbar, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { deleteMaintenanceRequest, searchMaintenanceRequests } from '../services/maintenanceRequestService';
import { getSites } from '../../site/services/siteService';
import { useAuth } from '../../../shared/context/AuthContext';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../../shared/utils/searchPayload';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonList from '../../../shared/components/common/CommonList';
import CommonStatusDropdown from '../../../shared/components/common/CommonStatusDropdown';
import { MAINTENANCE_REQUEST_STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../../shared/constants/statusOptions';

function MaintenanceRequestListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [filters, setFilters] = React.useState({ siteId: '', status: '', priority: '', search: '' });
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
        equalFilter('status', filters.status),
        equalFilter('priority', filters.priority),
        commonSearchFilter(filters.search),
      ],
      paginationModel,
      sortModel,
    });
    searchMaintenanceRequests(payload)
      .then((response) => {
        setRows(response.data || []);
        setRowCount(response.totalRecords || 0);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load maintenance requests.'))
      .finally(() => setLoading(false));
  }, [filters, paginationModel, sortModel]);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    getSites().then((data) => setSites((data || []).filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  const resetPage = () => setPaginationModel((current) => ({ ...current, page: 0 }));

  const updateFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
    resetPage();
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    try {
      await deleteMaintenanceRequest(deleteRow.id);
      setSuccess('Maintenance request deleted.');
      setDeleteRow(null);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete maintenance request.');
    }
  };

  const columns = [
    { field: 'requestNumber', headerName: 'Request No.', minWidth: 170, flex: 0.9 },
    { field: 'siteName', headerName: 'Site', minWidth: 170, flex: 0.9 },
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 180, flex: 1 },
    { field: 'title', headerName: 'Title', minWidth: 220, flex: 1.2 },
    { field: 'priority', headerName: 'Priority', minWidth: 110, flex: 0.6 },
    { field: 'status', headerName: 'Status', minWidth: 130, flex: 0.7 },
    { field: 'requestedDate', headerName: 'Requested', minWidth: 120, flex: 0.7 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      width: 70,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          {hasPermission('REQUEST_DELETE') && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteRow(row);
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Maintenance Requests</Typography>
          <Typography variant="body2" color="text.secondary">Log corrective, preventive, and inspection work requests.</Typography>
        </Box>
        {hasPermission('REQUEST_CREATE') && <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/maintenance/requests/new')}>Add Request</Button>}
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <CommonDropdown
            label="Site"
            value={filters.siteId}
            onChange={updateFilter('siteId')}
            options={sites}
            placeholder="All Sites"
            clearable
            getOptionLabel={(site) => `${site.siteName} (${site.siteCode})`}
            getOptionValue={(site) => site.id}
            sx={{ minWidth: 220 }}
          />
          <CommonStatusDropdown
            value={filters.status}
            onChange={updateFilter('status')}
            options={MAINTENANCE_REQUEST_STATUS_OPTIONS}
            placeholder="All Status"
            sx={{ minWidth: 180 }}
          />
          <CommonDropdown
            label="Priority"
            value={filters.priority}
            onChange={updateFilter('priority')}
            options={PRIORITY_OPTIONS}
            placeholder="All Priority"
            clearable
            sx={{ minWidth: 180 }}
          />
          <TextField label="Search" value={filters.search} onChange={updateFilter('search')} fullWidth />
        </Stack>
      </Paper>
      <CommonList
        rows={rows}
        columns={columns}
        loading={loading}
        dataGridProps={{
          paginationMode: 'server',
          sortingMode: 'server',
          rowCount,
          paginationModel,
          onPaginationModelChange: (model) => setPaginationModel((current) => (model.pageSize !== current.pageSize ? { ...model, page: 0 } : model)),
          sortModel,
          onSortModelChange: (model) => { setSortModel(model); resetPage(); },
          onRowClick: ({ row }) => navigate(`/maintenance/requests/${row.id}/view`),
          sx: {
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          },
        }}
      />
      <Dialog open={Boolean(deleteRow)} onClose={() => setDeleteRow(null)}>
        <DialogTitle>Delete maintenance request?</DialogTitle>
        <DialogContent><DialogContentText>This will delete {deleteRow?.requestNumber || deleteRow?.title}.</DialogContentText></DialogContent>
        <DialogActions><Button onClick={() => setDeleteRow(null)}>Cancel</Button><Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button></DialogActions>
      </Dialog>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess('')} message={success} />
    </Box>
  );
}

export default MaintenanceRequestListPage;

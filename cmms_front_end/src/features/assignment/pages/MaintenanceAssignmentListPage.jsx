import React from 'react';
import { Alert, Box, Button, Chip, IconButton, Paper, Snackbar, Stack, Tooltip, Typography } from '@mui/material';
import { Add, Clear, Delete, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { deleteMaintenanceAssignment, searchMaintenanceAssignments } from '../services/assignmentService';
import { getSites } from '../../site/services/siteService';
import { getVendors } from '../../vendor/services/vendorService';
import { useAuth } from '../../../shared/context/AuthContext';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../../shared/utils/searchPayload';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonList from '../../../shared/components/common/CommonList';
import CommonStatusDropdown from '../../../shared/components/common/CommonStatusDropdown';
import ConfirmDialog from '../../../shared/components/common/ConfirmDialog';
import { ASSIGNMENT_STATUS_OPTIONS, MAINTENANCE_REQUEST_STATUS_OPTIONS } from '../../../shared/constants/statusOptions';

const emptyFilters = { siteId: '', requestStatus: '', vendorId: '', status: '', search: '' };
const statusColors = {
  ASSIGNED: 'info',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const formatApiError = (err, fallback) => {
  const apiError = err.response?.data || err.apiError;
  if (!apiError) return fallback;
  const details = Array.isArray(apiError.details) && apiError.details.length
    ? ` ${apiError.details.map((detail) => detail.field ? `${detail.field}: ${detail.message}` : detail.message).join(' ')}`
    : '';
  const code = apiError.code ? ` (${apiError.code})` : '';
  const correlation = apiError.correlationId ? ` Correlation: ${apiError.correlationId}` : '';
  return `${apiError.message || fallback}${code}.${details}${correlation}`.trim();
};

function MaintenanceAssignmentListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
  const [filters, setFilters] = React.useState(emptyFilters);
  const [searchInput, setSearchInput] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
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
      .catch((err) => setError(formatApiError(err, 'Unable to load assignments.')))
      .finally(() => setLoading(false));
  }, [filters, paginationModel, sortModel]);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFilters((current) => ({ ...current, search: searchInput }));
      resetPage();
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  React.useEffect(() => {
    Promise.all([getSites(), getVendors({ status: 'ACTIVE' })])
      .then(([siteRows, vendorRows]) => {
        setSites((siteRows || []).filter((site) => site.status !== 'INACTIVE'));
        setVendors(vendorRows || []);
      })
      .catch((err) => setError(formatApiError(err, 'Unable to load filters.')));
  }, []);

  const resetPage = () => setPaginationModel((current) => ({ ...current, page: 0 }));

  const updateFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
    resetPage();
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setSearchInput('');
    resetPage();
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    setDeleteLoading(true);
    try {
      await deleteMaintenanceAssignment(deleteRow.id);
      setSuccess('Assignment deleted.');
      setDeleteRow(null);
      loadRows();
    } catch (err) {
      setError(formatApiError(err, 'Unable to delete assignment.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { field: 'siteName', headerName: 'Site', minWidth: 170, flex: 0.8 },
    { field: 'requestNumber', headerName: 'Request No.', minWidth: 170, flex: 0.9 },
    { field: 'requestTitle', headerName: 'Request', minWidth: 220, flex: 1.2 },
    { field: 'requestPriority', headerName: 'Priority', minWidth: 120, flex: 0.55, valueGetter: ({ row }) => row.requestPriority || row.priority || '-' },
    { field: 'assignedEmployeeName', headerName: 'Technician', minWidth: 170, flex: 0.8, valueGetter: ({ row }) => row.assignedEmployeeName || row.assignedTo },
    { field: 'vendorName', headerName: 'Vendor', minWidth: 180, flex: 1 },
    { field: 'assignedDate', headerName: 'Assigned', minWidth: 120, flex: 0.7, valueFormatter: ({ value }) => formatDate(value) },
    { field: 'plannedEndDate', headerName: 'Due', minWidth: 120, flex: 0.7, valueFormatter: ({ value }) => formatDate(value) },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 190,
      flex: 0.85,
      renderCell: ({ row }) => {
        const status = row.status || 'ASSIGNED';
        const overdue = row.plannedEndDate && !['COMPLETED', 'CANCELLED'].includes(status) && new Date(row.plannedEndDate) < new Date();
        return (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Chip size="small" label={status.replaceAll('_', ' ')} color={statusColors[status] || 'default'} />
            {overdue && <Chip size="small" label="Overdue" color="error" variant="outlined" />}
          </Stack>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 140,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          {hasPermission('ASSIGNMENT_VIEW') && <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/maintenance/assignments/${row.id}/view`)}><Visibility fontSize="small" /></IconButton></Tooltip>}
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
            label="Request Status"
            value={filters.requestStatus}
            onChange={updateFilter('requestStatus')}
            options={MAINTENANCE_REQUEST_STATUS_OPTIONS}
            placeholder="All Requests"
            sx={{ minWidth: 180 }}
          />
          <CommonDropdown
            label="Vendor"
            value={filters.vendorId}
            onChange={updateFilter('vendorId')}
            options={vendors}
            placeholder="All Vendors"
            clearable
            getOptionLabel={(vendor) => vendor.vendorName}
            getOptionValue={(vendor) => vendor.id}
            sx={{ minWidth: 220 }}
          />
          <CommonStatusDropdown
            label="Assignment Status"
            value={filters.status}
            onChange={updateFilter('status')}
            options={ASSIGNMENT_STATUS_OPTIONS}
            placeholder="All Status"
            sx={{ minWidth: 180 }}
          />
          <CommonInput label="Search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} fullWidth />
          <Button variant="outlined" startIcon={<Clear />} onClick={clearFilters} sx={{ minWidth: 140 }}>Clear</Button>
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
          onRowDoubleClick: ({ row }) => {
            if (hasPermission('ASSIGNMENT_VIEW')) navigate(`/maintenance/assignments/${row.id}/view`);
          },
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteRow)}
        handleClose={() => !deleteLoading && setDeleteRow(null)}
        title="Delete assignment?"
        message={`This will delete assignment for ${deleteRow?.requestNumber || deleteRow?.requestTitle || 'the selected request'}.`}
        handleAgree={confirmDelete}
        closebtn="Cancel"
        agreebtn={deleteLoading ? 'Deleting...' : 'Delete'}
        isOuterClick
      />
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess('')} message={success} />
    </Box>
  );
}

export default MaintenanceAssignmentListPage;

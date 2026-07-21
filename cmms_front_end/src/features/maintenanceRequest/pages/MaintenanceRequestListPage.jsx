import React from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, Snackbar, Stack, Tooltip, Typography } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { deleteMaintenanceRequest, getRequestQueueSummary, searchMaintenanceRequests } from '../services/maintenanceRequestService';
import { getSites } from '../../site/services/siteService';
import { useAuth } from '../../../shared/context/AuthContext';
import { commonSearchFilter, createSearchPayload, equalFilter, inFilter } from '../../../shared/utils/searchPayload';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonList from '../../../shared/components/common/CommonList';
import CommonStatusDropdown from '../../../shared/components/common/CommonStatusDropdown';
import CommonInput from '../../../shared/components/common/CommonInput';
import { MAINTENANCE_REQUEST_STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../../shared/constants/statusOptions';

function MaintenanceRequestListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [filters, setFilters] = React.useState({ siteId: '', status: '', priority: '', search: '' });
  const [activeQueue, setActiveQueue] = React.useState('all');
  const [queueSummary, setQueueSummary] = React.useState(null);
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
        Array.isArray(filters.status) ? inFilter('status', filters.status) : equalFilter('status', filters.status),
        Array.isArray(filters.priority) ? inFilter('priority', filters.priority) : equalFilter('priority', filters.priority),
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
    getRequestQueueSummary(filters.siteId ? { siteId: filters.siteId } : {})
      .then((data) => setQueueSummary(data || null))
      .catch(() => setQueueSummary(null));
  }, [filters.siteId]);
  React.useEffect(() => {
    getSites().then((data) => setSites((data || []).filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  const resetPage = () => setPaginationModel((current) => ({ ...current, page: 0 }));

  const updateFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
    if (field !== 'search') {
      setActiveQueue('all');
    }
    resetPage();
  };

  const applyQueue = (queue) => {
    setActiveQueue(queue.key);
    setFilters((current) => ({
      ...current,
      status: queue.status || '',
      priority: queue.priority || '',
    }));
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
    {
      field: 'priority',
      headerName: 'Priority',
      minWidth: 120,
      flex: 0.6,
      renderCell: ({ value }) => <PriorityChip value={value} />,
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 150,
      flex: 0.8,
      renderCell: ({ value }) => <StatusChip value={value} />,
    },
    { field: 'requestedDate', headerName: 'Requested', minWidth: 120, flex: 0.7 },
    { field: 'targetCompletionDate', headerName: 'Target', minWidth: 120, flex: 0.7 },
    {
      field: 'ageing',
      headerName: 'Ageing',
      minWidth: 110,
      flex: 0.6,
      valueGetter: ({ row }) => ageingLabel(row.requestedDate),
      renderCell: ({ row }) => (
        <Typography variant="body2" color={isOverdue(row) ? 'error.main' : 'text.primary'} fontWeight={isOverdue(row) ? 800 : 500}>
          {ageingLabel(row.requestedDate)}
        </Typography>
      ),
    },
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
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          {queueTabs.map((queue) => (
            <Button
              key={queue.key}
              size="small"
              variant={activeQueue === queue.key ? 'contained' : 'outlined'}
              color={queue.color || 'primary'}
              onClick={() => applyQueue(queue)}
            >
              {queue.label} {queueSummary ? `(${queue.count(queueSummary) || 0})` : ''}
            </Button>
          ))}
        </Stack>
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
            value={Array.isArray(filters.priority) ? '' : filters.priority}
            onChange={updateFilter('priority')}
            options={PRIORITY_OPTIONS}
            placeholder="All Priority"
            clearable
            sx={{ minWidth: 180 }}
          />
          <CommonInput label="Search" value={filters.search} onChange={updateFilter('search')} fullWidth />
        </Stack>
      </Paper>
      <CommonList
        rows={rows}
        columns={columns}
        loading={loading}
        viewPermission="REQUEST_VIEW"
        getRowViewPath={(row) => `/maintenance/requests/${row.id}/view`}
        dataGridProps={{
          paginationMode: 'server',
          sortingMode: 'server',
          rowCount,
          paginationModel,
          onPaginationModelChange: (model) => setPaginationModel((current) => (model.pageSize !== current.pageSize ? { ...model, page: 0 } : model)),
          sortModel,
          onSortModelChange: (model) => { setSortModel(model); resetPage(); },
          sx: {
            '& .request-row-critical': {
              bgcolor: 'rgba(211, 47, 47, 0.06)',
            },
            '& .request-row-overdue': {
              bgcolor: 'rgba(237, 108, 2, 0.06)',
            },
          },
          getRowClassName: ({ row }) => {
            if (isCritical(row.priority)) return 'request-row-critical';
            if (isOverdue(row)) return 'request-row-overdue';
            return '';
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

const queueTabs = [
  { key: 'all', label: 'All', count: (summary) => summary.all },
  { key: 'pendingApproval', label: 'Pending Approval', status: 'PENDING_APPROVAL', color: 'warning', count: (summary) => summary.pendingApproval },
  { key: 'open', label: 'Open', status: 'OPEN', count: (summary) => summary.open },
  { key: 'assigned', label: 'Assigned', status: 'ASSIGNED', count: (summary) => summary.assigned },
  { key: 'inProgress', label: 'In Progress', status: 'IN_PROGRESS', count: (summary) => summary.inProgress },
  { key: 'critical', label: 'Urgent / High', priority: ['URGENT', 'HIGH', 'CRITICAL'], color: 'error', count: (summary) => summary.critical },
  { key: 'completed', label: 'Completed', status: 'COMPLETED', color: 'success', count: (summary) => summary.completed },
  { key: 'closed', label: 'Closed', status: 'CLOSED', count: (summary) => summary.closed },
];

function PriorityChip({ value }) {
  const priority = String(value || '').toUpperCase();
  const color = priority === 'URGENT' || priority === 'CRITICAL' ? 'error' : priority === 'HIGH' ? 'warning' : priority === 'LOW' ? 'default' : 'info';
  return <Chip size="small" label={formatLabel(value)} color={color} variant={priority === 'LOW' ? 'outlined' : 'filled'} />;
}

function StatusChip({ value }) {
  const status = String(value || '').toUpperCase();
  const color = status.includes('PENDING') ? 'warning' : status === 'COMPLETED' || status === 'CLOSED' ? 'success' : status === 'CANCELLED' || status === 'REJECTED' ? 'error' : 'info';
  return <Chip size="small" label={formatLabel(value)} color={color} variant="outlined" />;
}

function ageingLabel(value) {
  if (!value) return '-';
  const requested = new Date(`${value}T00:00:00`);
  if (Number.isNaN(requested.getTime())) return '-';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.floor((today - requested) / 86400000));
  return days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'}`;
}

function isOverdue(row) {
  if (!row?.targetCompletionDate || ['COMPLETED', 'CLOSED', 'CANCELLED', 'REJECTED'].includes(String(row.status || '').toUpperCase())) {
    return false;
  }
  const target = new Date(`${row.targetCompletionDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return target < today;
}

function isCritical(priority) {
  return ['CRITICAL', 'URGENT', 'HIGH'].includes(String(priority || '').toUpperCase());
}

function formatLabel(value) {
  if (!value) return '-';
  return String(value).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export default MaintenanceRequestListPage;

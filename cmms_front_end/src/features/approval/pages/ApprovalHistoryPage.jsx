import React from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Refresh, Visibility } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getApprovalById, searchApprovalHistory } from '../services/approvalService';
import { getSites } from '../../site/services/siteService';
import { commonSearchFilter, createSearchPayload, equalFilter, rangeFilter } from '../../../shared/utils/searchPayload';

function ApprovalHistoryPage() {
  const [rows, setRows] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [filters, setFilters] = React.useState({
    moduleCode: '',
    actionCode: '',
    approvalStatus: '',
    siteId: '',
    requestedFrom: '',
    requestedTo: '',
    search: '',
  });
  const [rowCount, setRowCount] = React.useState(0);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [details, setDetails] = React.useState(null);
  const [detailsLoading, setDetailsLoading] = React.useState(false);

  const loadRows = React.useCallback(() => {
    setLoading(true);
    setError('');
    const payload = createSearchPayload({
      filters: [
        equalFilter('moduleCode', filters.moduleCode),
        equalFilter('actionCode', filters.actionCode),
        equalFilter('approvalStatus', filters.approvalStatus),
        equalFilter('siteId', filters.siteId, 'NUMBER'),
        rangeFilter('requestedAt', filters.requestedFrom ? `${filters.requestedFrom}T00:00:00` : '', 'gte', 'DATETIME'),
        rangeFilter('requestedAt', filters.requestedTo ? `${filters.requestedTo}T23:59:59` : '', 'lte', 'DATETIME'),
        commonSearchFilter(filters.search),
      ],
      paginationModel,
      sortModel,
    });
    searchApprovalHistory(payload)
      .then((response) => {
        setRows(response.data || []);
        setRowCount(response.totalRecords || 0);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load approval history.'))
      .finally(() => setLoading(false));
  }, [filters, paginationModel, sortModel]);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    getSites()
      .then((data) => setSites((data || []).filter((site) => site.status !== 'INACTIVE')))
      .catch(() => setError('Unable to load sites.'));
  }, []);

  const resetPage = () => setPaginationModel((current) => ({ ...current, page: 0 }));

  const updateFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
    resetPage();
  };

  const updatePaginationModel = (model) => {
    setPaginationModel((current) => (model.pageSize !== current.pageSize ? { ...model, page: 0 } : model));
  };

  const openDetails = async (row) => {
    setDetails(row);
    setDetailsLoading(true);
    setError('');
    try {
      setDetails(await getApprovalById(row.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load approval details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const columns = [
    { field: 'moduleCode', headerName: 'Module', minWidth: 180, flex: 0.9 },
    { field: 'actionCode', headerName: 'Action', minWidth: 130, flex: 0.6 },
    { field: 'referenceCode', headerName: 'Reference', minWidth: 170, flex: 0.8 },
    { field: 'siteName', headerName: 'Site', minWidth: 170, flex: 0.8 },
    { field: 'requestedByName', headerName: 'Requested By', minWidth: 160, flex: 0.8 },
    { field: 'requestedAt', headerName: 'Requested At', minWidth: 180, flex: 0.8, valueFormatter: ({ value }) => value ? new Date(value).toLocaleString() : '' },
    { field: 'approvalStatus', headerName: 'Status', minWidth: 130, flex: 0.6 },
    { field: 'approverRoleCode', headerName: 'Approver Role', minWidth: 160, flex: 0.7 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 100,
      renderCell: ({ row }) => (
        <Tooltip title="View">
          <IconButton size="small" onClick={() => openDetails(row)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const actionColumns = [
    { field: 'actionStatus', headerName: 'Action', minWidth: 130, flex: 0.6 },
    { field: 'approverName', headerName: 'Approver', minWidth: 170, flex: 0.8 },
    { field: 'comments', headerName: 'Comments', minWidth: 240, flex: 1.2 },
    { field: 'actionAt', headerName: 'Action At', minWidth: 180, flex: 0.8, valueFormatter: ({ value }) => value ? new Date(value).toLocaleString() : '' },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Approval History</Typography>
          <Typography variant="body2" color="text.secondary">Review pending, approved, and rejected approval requests.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={loadRows}>Refresh</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select label="Module" value={filters.moduleCode} onChange={updateFilter('moduleCode')} sx={{ minWidth: 210 }}>
            <MenuItem value="">All Modules</MenuItem>
            <MenuItem value="MAINTENANCE_REQUEST">Maintenance Request</MenuItem>
            <MenuItem value="PM_SCHEDULE">PM Schedule</MenuItem>
            <MenuItem value="PM_WORK_ORDER">PM Work Order</MenuItem>
            <MenuItem value="SPARE_ISSUE">Spare Issue</MenuItem>
          </TextField>
          <TextField select label="Action" value={filters.actionCode} onChange={updateFilter('actionCode')} sx={{ minWidth: 160 }}>
            <MenuItem value="">All Actions</MenuItem>
            <MenuItem value="CREATE">Create</MenuItem>
            <MenuItem value="UPDATE">Update</MenuItem>
            <MenuItem value="GENERATE">Generate</MenuItem>
            <MenuItem value="CLOSE">Close</MenuItem>
            <MenuItem value="RESERVE">Reserve</MenuItem>
            <MenuItem value="ISSUE">Issue</MenuItem>
          </TextField>
          <TextField select label="Status" value={filters.approvalStatus} onChange={updateFilter('approvalStatus')} sx={{ minWidth: 160 }}>
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </TextField>
          <TextField select label="Site" value={filters.siteId} onChange={updateFilter('siteId')} sx={{ minWidth: 220 }}>
            <MenuItem value="">All Sites</MenuItem>
            {sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}
          </TextField>
          <TextField type="date" label="Requested From" value={filters.requestedFrom} onChange={updateFilter('requestedFrom')} InputLabelProps={{ shrink: true }} sx={{ minWidth: 170 }} />
          <TextField type="date" label="Requested To" value={filters.requestedTo} onChange={updateFilter('requestedTo')} InputLabelProps={{ shrink: true }} sx={{ minWidth: 170 }} />
          <TextField label="Search" value={filters.search} onChange={updateFilter('search')} sx={{ minWidth: { xs: '100%', md: 260 } }} />
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
          onPaginationModelChange={updatePaginationModel}
          sortModel={sortModel}
          onSortModelChange={(model) => { setSortModel(model); resetPage(); }}
        />
      </Paper>

      <Dialog open={Boolean(details)} onClose={() => setDetails(null)} maxWidth="md" fullWidth>
        <DialogTitle>Approval Details</DialogTitle>
        <DialogContent>
          {details && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Typography variant="body2"><strong>Module:</strong> {details.moduleCode}</Typography>
                <Typography variant="body2"><strong>Action:</strong> {details.actionCode}</Typography>
                <Typography variant="body2"><strong>Status:</strong> {details.approvalStatus}</Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Typography variant="body2"><strong>Reference:</strong> {details.referenceCode || details.referenceId || '-'}</Typography>
                <Typography variant="body2"><strong>Site:</strong> {details.siteName || '-'}</Typography>
                <Typography variant="body2"><strong>Requested By:</strong> {details.requestedByName || '-'}</Typography>
              </Stack>
              <Typography variant="body2"><strong>Remarks:</strong> {details.remarks || '-'}</Typography>
              <Box sx={{ height: 280 }}>
                <DataGrid
                  rows={details.actions || []}
                  columns={actionColumns}
                  loading={detailsLoading}
                  disableRowSelectionOnClick
                  hideFooter
                />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetails(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ApprovalHistoryPage;

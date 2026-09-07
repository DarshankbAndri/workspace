import React from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import { searchPendingApprovals, approveApproval, rejectApproval } from '../services/approvalService';
import { getSites } from '../../site/services/siteService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import { createSearchPayload, equalFilter, rangeFilter } from '../../../shared/utils/searchPayload';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonList from '../../../shared/components/common/CommonList';
import CommonFilterPanel from '../../../shared/components/common/CommonFilterPanel';
import CommonPageHeader from '../../../shared/components/common/CommonPageHeader';
import CommonStatusChip from '../../../shared/components/common/CommonStatusChip';
import { APPROVAL_ACTION_OPTIONS, APPROVAL_MODULE_OPTIONS } from '../../../shared/constants/statusOptions';

function ApprovalInboxPage() {
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [filters, setFilters] = React.useState({ moduleCode: '', actionCode: '', siteId: '', requestedFrom: '', requestedTo: '' });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [decision, setDecision] = React.useState(null);
  const [comments, setComments] = React.useState('');
  const [rowCount, setRowCount] = React.useState(0);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([]);

  const loadRows = React.useCallback(() => {
    setLoading(true);
    setError('');
    const payload = createSearchPayload({
      filters: [
        equalFilter('moduleCode', filters.moduleCode),
        equalFilter('actionCode', filters.actionCode),
        equalFilter('siteId', filters.siteId, 'NUMBER'),
        rangeFilter('requestedAt', filters.requestedFrom ? `${filters.requestedFrom}T00:00:00` : '', 'greater_than_equal', 'DATETIME'),
        rangeFilter('requestedAt', filters.requestedTo ? `${filters.requestedTo}T23:59:59` : '', 'less_than_equal', 'DATETIME'),
      ],
      paginationModel,
      sortModel,
    });
    searchPendingApprovals(payload)
      .then((page) => {
        setRows(page.data || []);
        setRowCount(page.totalRecords || 0);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load approvals.'))
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
  const updatePaginationModel = (model) => {
    setPaginationModel((current) => ({
      page: model.pageSize !== current.pageSize ? 0 : model.page,
      pageSize: model.pageSize,
    }));
  };

  const submitDecision = async () => {
    if (!decision) return;
    try {
      if (decision.type === 'APPROVE') {
        await approveApproval(decision.row.id, comments);
        setSuccess('Approval request approved.');
      } else {
        await rejectApproval(decision.row.id, comments);
        setSuccess('Approval request rejected.');
      }
      setDecision(null);
      setComments('');
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit approval decision.');
    }
  };

  const columns = [
    { field: 'moduleCode', headerName: 'Module', minWidth: 180, flex: 0.9 },
    { field: 'actionCode', headerName: 'Action', minWidth: 130, flex: 0.6 },
    { field: 'referenceCode', headerName: 'Reference Code', minWidth: 170, flex: 0.8 },
    { field: 'siteName', headerName: 'Site', minWidth: 170, flex: 0.8 },
    { field: 'requestedByName', headerName: 'Requested By', minWidth: 160, flex: 0.8 },
    { field: 'requestedAt', headerName: 'Requested At', minWidth: 180, flex: 0.8, valueFormatter: ({ value }) => value ? new Date(value).toLocaleString() : '' },
    { field: 'approvalStatus', headerName: 'Status', minWidth: 140, flex: 0.6, renderCell: ({ value }) => <CommonStatusChip value={value} /> },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 220,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.75}>
          {hasPermission(PERMISSIONS.APPROVAL_VIEW) && <Button size="small" startIcon={<Visibility />} onClick={() => setDecision({ type: 'VIEW', row })}>View</Button>}
          {hasPermission(PERMISSIONS.APPROVAL_APPROVE) && <Button size="small" color="success" startIcon={<CheckCircle />} onClick={() => setDecision({ type: 'APPROVE', row })}>Approve</Button>}
          {hasPermission(PERMISSIONS.APPROVAL_REJECT) && <Button size="small" color="error" startIcon={<Cancel />} onClick={() => setDecision({ type: 'REJECT', row })}>Reject</Button>}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <CommonPageHeader title="Pending Approvals" subtitle="Review and decide workflow requests waiting for action." sx={{ mb: 2 }} data-testid="approval-inbox-header" />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <CommonFilterPanel sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <CommonDropdown label="Module" value={filters.moduleCode} onChange={updateFilter('moduleCode')} options={APPROVAL_MODULE_OPTIONS} placeholder="All Modules" clearable sx={{ minWidth: 210 }} />
          <CommonDropdown label="Action" value={filters.actionCode} onChange={updateFilter('actionCode')} options={APPROVAL_ACTION_OPTIONS} placeholder="All Actions" clearable sx={{ minWidth: 160 }} />
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
          <TextField type="date" label="Requested From" value={filters.requestedFrom} onChange={updateFilter('requestedFrom')} InputLabelProps={{ shrink: true }} sx={{ minWidth: 170 }} />
          <TextField type="date" label="Requested To" value={filters.requestedTo} onChange={updateFilter('requestedTo')} InputLabelProps={{ shrink: true }} sx={{ minWidth: 170 }} />
        </Stack>
      </CommonFilterPanel>
      <CommonList
        rows={rows}
        columns={columns}
        loading={loading}
        emptyMessage="No pending approvals found."
        onRetry={loadRows}
        tableTestId="approval-inbox-table"
        dataGridProps={{
          paginationMode: 'server',
          sortingMode: 'server',
          rowCount,
          paginationModel,
          onPaginationModelChange: updatePaginationModel,
          sortModel,
          onSortModelChange: (model) => { setSortModel(model); resetPage(); },
        }}
      />
      <Dialog
        open={Boolean(decision)}
        onClose={() => setDecision(null)}
        maxWidth={false}
        PaperProps={{ sx: { width: { xs: 'calc(100% - 32px)', sm: 520 }, maxWidth: 'calc(100% - 32px)', m: 2 } }}
      >
        <DialogTitle>{decision?.type === 'VIEW' ? 'Approval Details' : `${decision?.type === 'APPROVE' ? 'Approve' : 'Reject'} Approval`}</DialogTitle>
        <DialogContent>
          {decision?.row && (
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              <Typography variant="body2"><strong>Module:</strong> {decision.row.moduleCode}</Typography>
              <Typography variant="body2"><strong>Action:</strong> {decision.row.actionCode}</Typography>
              <Typography variant="body2"><strong>Reference:</strong> {decision.row.referenceCode || decision.row.referenceId}</Typography>
              <Typography variant="body2"><strong>Requested By:</strong> {decision.row.requestedByName || '-'}</Typography>
              <Typography variant="body2"><strong>Remarks:</strong> {decision.row.remarks || '-'}</Typography>
              {decision.type !== 'VIEW' && <TextField multiline minRows={3} label="Comments" value={comments} onChange={(event) => setComments(event.target.value)} fullWidth />}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecision(null)}>Close</Button>
          {decision?.type !== 'VIEW' && <Button variant="contained" color={decision?.type === 'APPROVE' ? 'success' : 'error'} onClick={submitDecision}>Submit</Button>}
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} message={success} onClose={() => setSuccess('')} />
    </Box>
  );
}

export default ApprovalInboxPage;

import React from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getPendingApprovals, approveApproval, rejectApproval } from '../../services/approvalService';
import { getSites } from '../../services/siteService';

function ApprovalInboxPage() {
  const [rows, setRows] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [filters, setFilters] = React.useState({ moduleCode: '', actionCode: '', siteId: '', status: '', requestedFrom: '', requestedTo: '' });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [decision, setDecision] = React.useState(null);
  const [comments, setComments] = React.useState('');

  const loadRows = React.useCallback(() => {
    setLoading(true);
    getPendingApprovals()
      .then((data) => setRows(data || []))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load approvals.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    getSites().then((data) => setSites((data || []).filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  const visibleRows = React.useMemo(() => rows.filter((row) => {
    const requestedDate = row.requestedAt ? row.requestedAt.slice(0, 10) : '';
    return (!filters.moduleCode || row.moduleCode === filters.moduleCode)
      && (!filters.actionCode || row.actionCode === filters.actionCode)
      && (!filters.siteId || String(row.siteId || '') === String(filters.siteId))
      && (!filters.status || row.approvalStatus === filters.status)
      && (!filters.requestedFrom || requestedDate >= filters.requestedFrom)
      && (!filters.requestedTo || requestedDate <= filters.requestedTo);
  }), [rows, filters]);

  const updateFilter = (field) => (event) => setFilters((current) => ({ ...current, [field]: event.target.value }));

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
    { field: 'approvalStatus', headerName: 'Status', minWidth: 130, flex: 0.6 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 220,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.75}>
          <Button size="small" startIcon={<Visibility />} onClick={() => setDecision({ type: 'VIEW', row })}>View</Button>
          <Button size="small" color="success" startIcon={<CheckCircle />} onClick={() => setDecision({ type: 'APPROVE', row })}>Approve</Button>
          <Button size="small" color="error" startIcon={<Cancel />} onClick={() => setDecision({ type: 'REJECT', row })}>Reject</Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>Pending Approvals</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select label="Module" value={filters.moduleCode} onChange={updateFilter('moduleCode')} sx={{ minWidth: 210 }}>
            <MenuItem value="">All Modules</MenuItem>
            <MenuItem value="PM_SCHEDULE">PM Schedule</MenuItem>
            <MenuItem value="PM_WORK_ORDER">PM Work Order</MenuItem>
            <MenuItem value="MAINTENANCE_REQUEST">Maintenance Request</MenuItem>
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
          <TextField select label="Site" value={filters.siteId} onChange={updateFilter('siteId')} sx={{ minWidth: 220 }}>
            <MenuItem value="">All Sites</MenuItem>
            {sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}
          </TextField>
          <TextField type="date" label="Requested From" value={filters.requestedFrom} onChange={updateFilter('requestedFrom')} InputLabelProps={{ shrink: true }} sx={{ minWidth: 170 }} />
          <TextField type="date" label="Requested To" value={filters.requestedTo} onChange={updateFilter('requestedTo')} InputLabelProps={{ shrink: true }} sx={{ minWidth: 170 }} />
        </Stack>
      </Paper>
      <Paper sx={{ height: 560, borderRadius: 1 }}>
        <DataGrid rows={visibleRows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>
      <Dialog open={Boolean(decision)} onClose={() => setDecision(null)} maxWidth="sm" fullWidth>
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

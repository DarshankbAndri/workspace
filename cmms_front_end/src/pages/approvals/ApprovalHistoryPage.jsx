import React from 'react';
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { getApprovalHistory } from '../../services/approvalService';

function ApprovalHistoryPage() {
  const [moduleCode, setModuleCode] = React.useState('MAINTENANCE_REQUEST');
  const [referenceId, setReferenceId] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadRows = async () => {
    if (!referenceId) {
      setError('Reference ID is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getApprovalHistory({ moduleCode, referenceId });
      setRows(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load approval history.');
    } finally {
      setLoading(false);
    }
  };

  const actionRows = rows.flatMap((row) => (
    (row.actions || []).length
      ? row.actions.map((action) => ({ ...action, moduleCode: row.moduleCode, actionCode: row.actionCode, referenceCode: row.referenceCode, approvalStatus: row.approvalStatus }))
      : [{ id: `request-${row.id}`, moduleCode: row.moduleCode, actionCode: row.actionCode, referenceCode: row.referenceCode, approvalStatus: row.approvalStatus, actionStatus: '-', approverName: '-', comments: row.remarks, actionAt: row.requestedAt }]
  ));

  const columns = [
    { field: 'moduleCode', headerName: 'Module', minWidth: 180, flex: 0.9 },
    { field: 'actionCode', headerName: 'Action', minWidth: 130, flex: 0.6 },
    { field: 'referenceCode', headerName: 'Reference', minWidth: 170, flex: 0.8 },
    { field: 'approvalStatus', headerName: 'Approval Status', minWidth: 150, flex: 0.7 },
    { field: 'actionStatus', headerName: 'Action Status', minWidth: 140, flex: 0.7 },
    { field: 'approverName', headerName: 'Approver', minWidth: 170, flex: 0.8 },
    { field: 'comments', headerName: 'Comments', minWidth: 220, flex: 1.2 },
    { field: 'actionAt', headerName: 'Action At', minWidth: 180, flex: 0.8, valueFormatter: ({ value }) => value ? new Date(value).toLocaleString() : '' },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>Approval History</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select label="Module" value={moduleCode} onChange={(event) => setModuleCode(event.target.value)} sx={{ minWidth: 240 }}>
            <MenuItem value="MAINTENANCE_REQUEST">Maintenance Request</MenuItem>
            <MenuItem value="PM_SCHEDULE">PM Schedule</MenuItem>
            <MenuItem value="PM_WORK_ORDER">PM Work Order</MenuItem>
          </TextField>
          <TextField label="Reference ID" value={referenceId} onChange={(event) => setReferenceId(event.target.value)} sx={{ minWidth: 180 }} />
          <Button variant="contained" startIcon={<Search />} onClick={loadRows}>Search</Button>
        </Stack>
      </Paper>
      <Paper sx={{ height: 560, borderRadius: 1 }}>
        <DataGrid rows={actionRows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>
    </Box>
  );
}

export default ApprovalHistoryPage;

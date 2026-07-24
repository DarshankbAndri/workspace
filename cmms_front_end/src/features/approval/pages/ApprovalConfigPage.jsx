import React from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Snackbar, Stack, Switch, TextField, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { createApprovalConfig, getApprovalConfigs, updateApprovalConfig } from '../services/approvalConfigService';
import { getRoles } from '../../admin/services/roleService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import { getDropdownOptions } from '../../../shared/utils/dropdownHelper';

const defaultApprovalConfigs = [
  { moduleCode: 'PM_SCHEDULE', actionCode: 'CREATE', approvalRequired: false, approverRoleCode: 'MAINTENANCE_MANAGER', minApprovalCount: 1, status: 'ACTIVE' },
  { moduleCode: 'PM_SCHEDULE', actionCode: 'UPDATE', approvalRequired: false, approverRoleCode: 'MAINTENANCE_MANAGER', minApprovalCount: 1, status: 'ACTIVE' },
  { moduleCode: 'PM_WORK_ORDER', actionCode: 'GENERATE', approvalRequired: false, approverRoleCode: 'MAINTENANCE_MANAGER', minApprovalCount: 1, status: 'ACTIVE' },
  { moduleCode: 'MAINTENANCE_REQUEST', actionCode: 'CREATE', approvalRequired: false, approverRoleCode: 'MAINTENANCE_MANAGER', minApprovalCount: 1, status: 'ACTIVE' },
  { moduleCode: 'MAINTENANCE_REQUEST', actionCode: 'CLOSE', approvalRequired: false, approverRoleCode: 'MAINTENANCE_MANAGER', minApprovalCount: 1, status: 'ACTIVE' },
  { moduleCode: 'SPARE_ISSUE', actionCode: 'RESERVE', approvalRequired: false, approverRoleCode: 'MAINTENANCE_MANAGER', minApprovalCount: 1, status: 'ACTIVE' },
  { moduleCode: 'SPARE_ISSUE', actionCode: 'ISSUE', approvalRequired: false, approverRoleCode: 'MAINTENANCE_MANAGER', minApprovalCount: 1, status: 'ACTIVE' },
];
const approvalStatusOptions = getDropdownOptions('APPROVAL', 'configStatus');
const anyApprovalUserOptions = getDropdownOptions('APPROVAL', 'anyApprovalUserOption');

function mergeDefaultConfigs(data = []) {
  const keyed = new Map((data || []).map((item) => [`${item.moduleCode}:${item.actionCode}`, item]));
  defaultApprovalConfigs.forEach((item) => {
    const key = `${item.moduleCode}:${item.actionCode}`;
    if (!keyed.has(key)) {
      keyed.set(key, { ...item, pendingCreate: true });
    }
  });
  return Array.from(keyed.values()).sort((a, b) => `${a.moduleCode}:${a.actionCode}`.localeCompare(`${b.moduleCode}:${b.actionCode}`));
}

function ApprovalConfigPage() {
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission(PERMISSIONS.APPROVAL_CONFIG_UPDATE);
  const [rows, setRows] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [editRow, setEditRow] = React.useState(null);
  const roleOptions = React.useMemo(() => [
    ...anyApprovalUserOptions,
    ...roles.map((role) => ({ value: role.roleCode, label: `${role.roleName} (${role.roleCode})` })),
  ], [roles]);

  const loadRows = React.useCallback(() => {
    setLoading(true);
    getApprovalConfigs()
      .then((data) => setRows(mergeDefaultConfigs(data)))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load approval config.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    getRoles().then((data) => setRoles((data || []).filter((role) => role.status !== 'INACTIVE'))).catch(() => setError('Unable to load roles.'));
  }, []);

  const updateField = (field) => (event) => {
    const value = field === 'approvalRequired' ? event.target.checked : event.target.value;
    setEditRow((current) => ({ ...current, [field]: value }));
  };

  const saveConfig = async () => {
    try {
      const payload = { ...editRow, minApprovalCount: Number(editRow.minApprovalCount || 1) };
      if (editRow.id) {
        await updateApprovalConfig(editRow.id, payload);
      } else {
        await createApprovalConfig(payload);
      }
      setSuccess('Approval config updated.');
      setEditRow(null);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update approval config.');
    }
  };

  const columns = [
    { field: 'moduleCode', headerName: 'Module', minWidth: 190, flex: 1 },
    { field: 'actionCode', headerName: 'Action', minWidth: 140, flex: 0.7 },
    { field: 'approvalRequired', headerName: 'Approval Required', minWidth: 160, flex: 0.7, valueFormatter: ({ value }) => value ? 'ON' : 'OFF' },
    { field: 'approverRoleCode', headerName: 'Approver Role', minWidth: 190, flex: 1, valueFormatter: ({ value }) => value || '-' },
    { field: 'minApprovalCount', headerName: 'Min Count', minWidth: 110, flex: 0.5 },
    { field: 'status', headerName: 'Status', minWidth: 120, flex: 0.5 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 110,
      renderCell: ({ row }) => canUpdate ? <Button size="small" startIcon={<Edit />} onClick={() => setEditRow(row)}>Edit</Button> : null,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>Approval Config</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ height: 560, borderRadius: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id || `${row.moduleCode}:${row.actionCode}`}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Paper>
      <Dialog
        open={Boolean(editRow)}
        onClose={() => setEditRow(null)}
        maxWidth={false}
        PaperProps={{ sx: { width: { xs: 'calc(100% - 32px)', sm: 520 }, maxWidth: 'calc(100% - 32px)', m: 2 } }}
      >
        <DialogTitle>Edit Approval Config</DialogTitle>
        <DialogContent>
          {editRow && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Module" value={editRow.moduleCode || ''} disabled fullWidth />
              <TextField label="Action" value={editRow.actionCode || ''} disabled fullWidth />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Switch checked={Boolean(editRow.approvalRequired)} onChange={updateField('approvalRequired')} />
                <Typography>Approval Required</Typography>
              </Stack>
              <CommonDropdown label="Approver Role" value={editRow.approverRoleCode || ''} options={roleOptions} onChange={updateField('approverRoleCode')} fullWidth />
              <TextField type="number" label="Min Approval Count" value={editRow.minApprovalCount || 1} onChange={updateField('minApprovalCount')} inputProps={{ min: 1 }} fullWidth />
              <CommonDropdown label="Status" value={editRow.status || 'ACTIVE'} options={approvalStatusOptions} onChange={updateField('status')} fullWidth />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRow(null)}>Cancel</Button>
          {canUpdate && <Button variant="contained" onClick={saveConfig}>Save</Button>}
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} message={success} onClose={() => setSuccess('')} />
    </Box>
  );
}

export default ApprovalConfigPage;

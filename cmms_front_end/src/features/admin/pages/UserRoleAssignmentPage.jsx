import React from 'react';
import { Alert, Box, Button, CircularProgress, Divider, Grid, IconButton, Stack, Typography } from '@mui/material';
import { Add, Delete, Save } from '@mui/icons-material';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonEmptyState from '../../../shared/components/common/CommonEmptyState';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';
import CommonPageHeader from '../../../shared/components/common/CommonPageHeader';
import { getRoles } from '../services/roleService';
import { getSites } from '../../site/services/siteService';
import {
  getUserRoleAssignments,
  getUserRoleUsers,
  replaceUserRoleAssignments,
} from '../services/userRoleService';

const newAssignment = () => ({ roleId: '', siteId: '', status: 'ACTIVE' });

function UserRoleAssignmentPage() {
  const { user, hasAnyPermission, refreshAccess } = useAuth();
  const canManage = hasAnyPermission([PERMISSIONS.USER_ROLE_ASSIGN, PERMISSIONS.USER_ROLE_UPDATE]);
  const [users, setUsers] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [selectedUserId, setSelectedUserId] = React.useState('');
  const [assignments, setAssignments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [assignmentLoading, setAssignmentLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    Promise.all([getUserRoleUsers(), getRoles(), getSites()])
      .then(([userRows, roleRows, siteRows]) => {
        setUsers(userRows || []);
        setRoles(roleRows || []);
        setSites(siteRows || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load users, roles, or sites.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (!selectedUserId) {
      setAssignments([]);
      return;
    }
    setAssignmentLoading(true);
    setError('');
    getUserRoleAssignments(selectedUserId)
      .then((rows) => setAssignments((rows || []).map((row) => ({
        id: row.id,
        roleId: row.roleId || '',
        siteId: row.siteId || '',
        status: 'ACTIVE',
      }))))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load role assignments.'))
      .finally(() => setAssignmentLoading(false));
  }, [selectedUserId]);

  const userOptions = React.useMemo(() => users.map((row) => ({
    value: row.id,
    label: `${row.username}${row.firstName || row.lastName ? ` - ${`${row.firstName || ''} ${row.lastName || ''}`.trim()}` : ''}${row.active === false ? ' (Inactive)' : ''}`,
  })), [users]);
  const roleOptions = React.useMemo(() => roles.map((row) => ({
    value: row.id,
    label: `${row.roleName} (${row.roleCode})${row.status === 'INACTIVE' ? ' (Inactive)' : ''}`,
    disabled: row.status === 'INACTIVE',
  })), [roles]);
  const siteOptions = React.useMemo(() => sites.map((row) => ({
    value: row.id,
    label: `${row.siteName} (${row.siteCode})${row.status === 'INACTIVE' ? ' (Inactive)' : ''}`,
    disabled: row.status === 'INACTIVE',
  })), [sites]);

  const updateAssignment = (index, field) => (event) => {
    const value = event.target.value;
    setAssignments((current) => current.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [field]: value } : row
    )));
  };

  const removeAssignment = (index) => {
    setAssignments((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  const saveAssignments = async () => {
    if (!selectedUserId) {
      setError('Select a user first.');
      return;
    }
    if (assignments.some((row) => !row.roleId)) {
      setError('Select a role for every assignment.');
      return;
    }
    const keys = assignments.map((row) => `${row.roleId}|${row.siteId || 'GLOBAL'}`);
    if (new Set(keys).size !== keys.length) {
      setError('The same role and site scope cannot be assigned more than once.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const saved = await replaceUserRoleAssignments(selectedUserId, assignments.map((row) => ({
        roleId: Number(row.roleId),
        siteId: row.siteId ? Number(row.siteId) : null,
        status: 'ACTIVE',
      })));
      setAssignments((saved || []).map((row) => ({
        id: row.id,
        roleId: row.roleId || '',
        siteId: row.siteId || '',
        status: 'ACTIVE',
      })));
      if (String(selectedUserId) === String(user?.id)) await refreshAccess().catch(() => {});
      setSuccess('User role assignments saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save role assignments.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <CommonPageHeader
        title="User Roles"
        subtitle="Assign global or site-scoped roles to application users."
        primaryAction={canManage && selectedUserId ? {
          label: 'Save Assignments',
          icon: <Save />,
          onClick: saveAssignments,
          loading: saving,
        } : undefined}
        sx={{ mb: 2 }}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <CommonFormCard title="Select User" subtitle="Role assignments below replace the selected user's current active assignments.">
        <CommonDropdown
          label="User"
          value={selectedUserId}
          onChange={(event) => setSelectedUserId(event.target.value)}
          options={userOptions}
          loading={loading}
          clearable
          fullWidth
        />
      </CommonFormCard>

      {selectedUserId && (
        <CommonFormCard
          title="Role Assignments"
          subtitle="Leave Site empty to grant the role globally."
          sx={{ mt: 2 }}
        >
          {assignmentLoading ? (
            <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
          ) : (
            <>
              {assignments.length === 0 && (
                <CommonEmptyState
                  title="No active role assignments"
                  description={canManage ? 'Add a role assignment for this user.' : 'This user has no active assigned roles.'}
                  sx={{ minHeight: 160 }}
                />
              )}
              <Stack spacing={2}>
                {assignments.map((assignment, index) => (
                  <Box key={assignment.id || `new-${index}`}>
                    {index > 0 && <Divider sx={{ mb: 2 }} />}
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={5}>
                        <CommonDropdown
                          required
                          label="Role"
                          value={assignment.roleId}
                          onChange={updateAssignment(index, 'roleId')}
                          options={roleOptions}
                          disabled={!canManage || saving}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <CommonDropdown
                          label="Site Scope"
                          value={assignment.siteId}
                          onChange={updateAssignment(index, 'siteId')}
                          options={siteOptions}
                          placeholder="Global access"
                          clearable
                          disabled={!canManage || saving}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        {canManage && (
                          <IconButton
                            color="error"
                            aria-label="Remove role assignment"
                            onClick={() => removeAssignment(index)}
                            disabled={saving}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
              {canManage && (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setAssignments((current) => [...current, newAssignment()])}
                  disabled={saving}
                  sx={{ mt: 2 }}
                >
                  Add Assignment
                </Button>
              )}
            </>
          )}
        </CommonFormCard>
      )}
    </Box>
  );
}

export default UserRoleAssignmentPage;

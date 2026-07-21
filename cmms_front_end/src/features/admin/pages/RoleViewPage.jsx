import React from 'react';
import { Box, Button, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoleById } from '../services/roleService';
import { useAuth } from '../../../shared/context/AuthContext';

function RoleViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [role, setRole] = React.useState(null);

  React.useEffect(() => {
    getRoleById(id).then(setRole);
  }, [id]);

  const groupedPermissions = React.useMemo(() => {
    return (role?.permissions || []).reduce((groups, permission) => {
      const key = permission.moduleName || 'General';
      groups[key] = groups[key] || [];
      groups[key].push(permission);
      return groups;
    }, {});
  }, [role]);

  if (!role) return null;

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h4">View Role</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/admin/roles')}>Back</Button>
          {hasPermission('ROLE_UPDATE') && (
            <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/admin/roles/${id}/edit`)}>
              Edit
            </Button>
          )}
        </Stack>
      </Stack>
      <Paper sx={{ p: 3, borderRadius: 1, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><Typography color="text.secondary">Role Code</Typography><Typography fontWeight={800}>{role.roleCode}</Typography></Grid>
          <Grid item xs={12} md={3}><Typography color="text.secondary">Role Name</Typography><Typography fontWeight={800}>{role.roleName}</Typography></Grid>
          <Grid item xs={12} md={3}><Typography color="text.secondary">Status</Typography><Chip size="small" color={role.status === 'ACTIVE' ? 'success' : 'default'} label={role.status} /></Grid>
          <Grid item xs={12} md={3}><Typography color="text.secondary">Permission Count</Typography><Typography fontWeight={800}>{role.permissionCount || 0}</Typography></Grid>
          <Grid item xs={12}><Typography color="text.secondary">Description</Typography><Typography>{role.description || '-'}</Typography></Grid>
        </Grid>
      </Paper>
      <Stack spacing={2}>
        {Object.entries(groupedPermissions).map(([moduleName, permissions]) => (
          <Paper key={moduleName} sx={{ p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>{moduleName}</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {permissions.map((permission) => <Chip key={permission.id} size="small" label={permission.permissionCode} />)}
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}

export default RoleViewPage;

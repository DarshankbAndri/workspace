import React from 'react';
import { Alert, Box, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { getRoles } from '../../../services/api';

function RoleListPage() {
  const [roles, setRoles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    getRoles()
      .then((response) => setRoles(response.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load roles'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Roles</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={1.5}>
          {roles.map((role) => (
            <Paper key={role.id} sx={{ p: 2, borderRadius: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Typography variant="subtitle1" fontWeight={800}>{role.roleName}</Typography>
                <Chip size="small" label={role.roleCode} />
                <Chip size="small" color={role.status === 'ACTIVE' ? 'success' : 'default'} label={role.status} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {(role.permissions || []).length} permissions assigned
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default RoleListPage;

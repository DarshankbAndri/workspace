import React from 'react';
import { Alert, Box, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { getGroupedPermissions } from '../../../shared/services/api';

function PermissionListPage() {
  const [groups, setGroups] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    getGroupedPermissions()
      .then((response) => setGroups(response.data || {}))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load permissions'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Permissions</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2}>
          {Object.entries(groups).map(([moduleName, permissions]) => (
            <Paper key={moduleName} sx={{ p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>{moduleName}</Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {permissions.map((permission) => (
                  <Chip key={permission.id} size="small" label={permission.permissionCode} />
                ))}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default PermissionListPage;

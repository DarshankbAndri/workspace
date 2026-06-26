import React from 'react';
import { Alert, Box, Paper, Typography } from '@mui/material';

function UserRoleAssignmentPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>User Roles</Typography>
      <Paper sx={{ p: 2, borderRadius: 1 }}>
        <Alert severity="info">
          User role assignment API is ready. A full assignment editor can be added on top of the existing users, roles, and sites data.
        </Alert>
      </Paper>
    </Box>
  );
}

export default UserRoleAssignmentPage;

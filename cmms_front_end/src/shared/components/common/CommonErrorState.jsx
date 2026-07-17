import React from 'react';
import { Alert, Button, Stack } from '@mui/material';
import { Refresh } from '@mui/icons-material';

function CommonErrorState({ message = 'Something went wrong.', onRetry, sx }) {
  return (
    <Alert
      severity="error"
      sx={{ mb: 2, alignItems: 'center', ...sx }}
      action={onRetry ? (
        <Button color="inherit" size="small" startIcon={<Refresh />} onClick={onRetry}>
          Retry
        </Button>
      ) : undefined}
    >
      <Stack component="span" direction="row" alignItems="center">
        {message}
      </Stack>
    </Alert>
  );
}

export default CommonErrorState;

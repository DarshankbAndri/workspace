import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

function CommonFileUpload({ label = 'Upload File', accept = '*', helperText, fileName, onChange, disabled, inputProps, ...buttonProps }) {
  return (
    <Stack spacing={0.75} sx={{ minWidth: 0 }}>
      <Button component="label" variant="outlined" startIcon={<CloudUpload />} disabled={disabled} sx={{ width: { xs: '100%', sm: 'fit-content' } }} {...buttonProps}>
        {label}
        <input hidden type="file" accept={accept} onChange={onChange} {...inputProps} />
      </Button>
      {(helperText || fileName) && (
        <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          {fileName || helperText}
        </Typography>
      )}
    </Stack>
  );
}

export default CommonFileUpload;

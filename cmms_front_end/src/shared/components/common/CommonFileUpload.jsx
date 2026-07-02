import React from 'react';
import { Button } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

function CommonFileUpload({ label = 'Upload File', accept = '*', onChange, disabled, inputProps, ...buttonProps }) {
  return (
    <Button component="label" variant="outlined" startIcon={<CloudUpload />} disabled={disabled} {...buttonProps}>
      {label}
      <input hidden type="file" accept={accept} onChange={onChange} {...inputProps} />
    </Button>
  );
}

export default CommonFileUpload;

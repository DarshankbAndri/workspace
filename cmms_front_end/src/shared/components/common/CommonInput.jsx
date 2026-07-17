import React from 'react';
import { TextField } from '@mui/material';

function CommonInput({ fullWidth = true, size = 'small', inputProps, ...props }) {
  return (
    <TextField
      fullWidth={fullWidth}
      size={size}
      inputProps={{
        'data-testid': props['data-testid'],
        ...inputProps,
      }}
      {...props}
    />
  );
}

export default CommonInput;

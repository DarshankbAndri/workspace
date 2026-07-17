import React from 'react';
import { TextField } from '@mui/material';

function CommonDatePicker({ fullWidth = true, size = 'small', InputLabelProps, ...props }) {
  return (
    <TextField
      type="date"
      fullWidth={fullWidth}
      size={size}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      {...props}
    />
  );
}

export default CommonDatePicker;

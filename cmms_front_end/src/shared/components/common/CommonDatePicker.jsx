import React from 'react';
import { TextField } from '@mui/material';

function CommonDatePicker({ fullWidth = true, InputLabelProps, ...props }) {
  return (
    <TextField
      type="date"
      fullWidth={fullWidth}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      {...props}
    />
  );
}

export default CommonDatePicker;

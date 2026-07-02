import React from 'react';
import { TextField } from '@mui/material';

function CommonDateTimePicker({ fullWidth = true, InputLabelProps, ...props }) {
  return (
    <TextField
      type="datetime-local"
      fullWidth={fullWidth}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      {...props}
    />
  );
}

export default CommonDateTimePicker;

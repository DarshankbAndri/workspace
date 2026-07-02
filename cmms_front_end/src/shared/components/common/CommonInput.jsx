import React from 'react';
import { TextField } from '@mui/material';

function CommonInput({ fullWidth = true, ...props }) {
  return <TextField fullWidth={fullWidth} {...props} />;
}

export default CommonInput;

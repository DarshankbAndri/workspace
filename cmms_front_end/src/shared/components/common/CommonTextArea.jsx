import React from 'react';
import { TextField } from '@mui/material';

function CommonTextArea({ fullWidth = true, minRows = 3, ...props }) {
  return <TextField fullWidth={fullWidth} multiline minRows={minRows} {...props} />;
}

export default CommonTextArea;

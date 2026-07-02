import React from 'react';
import { Paper, Typography } from '@mui/material';

function CommonFormCard({ title, subtitle, children, sx, ...props }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 1, ...sx }} {...props}>
      {title && (
        <Typography variant="h6" fontWeight={800} gutterBottom>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      {children}
    </Paper>
  );
}

export default CommonFormCard;

import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

function CommonEmptyState({ icon, title = 'No records found', description, action, sx }) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.25} sx={{ minHeight: 220, p: 3, textAlign: 'center', ...sx }}>
      <Box sx={{ color: 'text.secondary', display: 'grid', placeItems: 'center' }}>
        {icon || <InboxOutlined sx={{ fontSize: 44 }} />}
      </Box>
      <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
      {description && <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>{description}</Typography>}
      {action && <Button variant={action.variant || 'contained'} startIcon={action.icon} onClick={action.onClick}>{action.label}</Button>}
    </Stack>
  );
}

export default CommonEmptyState;

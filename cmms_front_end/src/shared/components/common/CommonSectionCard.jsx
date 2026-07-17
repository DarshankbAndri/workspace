import React from 'react';
import { Box, Divider, Paper, Stack, Typography } from '@mui/material';

function CommonSectionCard({
  title,
  subtitle,
  headerAction,
  children,
  divider = false,
  sx,
  contentSx,
  ...props
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        boxShadow: 1,
        minWidth: 0,
        ...sx,
      }}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'flex-start' }}>
            <Box sx={{ minWidth: 0 }}>
              {title && <Typography variant="h6">{title}</Typography>}
              {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{subtitle}</Typography>}
            </Box>
            {headerAction}
          </Stack>
          {divider && <Divider sx={{ my: 2 }} />}
        </>
      )}
      <Box sx={contentSx}>{children}</Box>
    </Paper>
  );
}

export default CommonSectionCard;

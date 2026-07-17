import React from 'react';
import { Box } from '@mui/material';

function CommonPageContainer({ children, maxWidth = '100%', sx, ...props }) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth,
        mx: 'auto',
        minWidth: 0,
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, md: 2.5 },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

export default CommonPageContainer;

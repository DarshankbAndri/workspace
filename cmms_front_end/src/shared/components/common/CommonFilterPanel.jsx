import React from 'react';
import { Button, Stack } from '@mui/material';
import { RestartAlt, Search } from '@mui/icons-material';
import CommonSectionCard from './CommonSectionCard';

function CommonFilterPanel({
  children,
  onSearch,
  onReset,
  searchLabel = 'Search',
  resetLabel = 'Reset',
  title,
  sx,
  actions,
}) {
  return (
    <CommonSectionCard title={title} sx={sx}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} useFlexGap flexWrap="wrap">
        {children}
        {(onSearch || onReset || actions) && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ ml: { md: 'auto' }, width: { xs: '100%', md: 'auto' } }}>
            {actions}
            {onReset && <Button variant="outlined" startIcon={<RestartAlt />} onClick={onReset}>{resetLabel}</Button>}
            {onSearch && <Button variant="contained" startIcon={<Search />} onClick={onSearch}>{searchLabel}</Button>}
          </Stack>
        )}
      </Stack>
    </CommonSectionCard>
  );
}

export default CommonFilterPanel;

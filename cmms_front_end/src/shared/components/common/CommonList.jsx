import React from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

function CommonList({
  title,
  subtitle,
  rows = [],
  columns = [],
  loading = false,
  error = '',
  filters,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  addLabel,
  onAdd,
  canAdd = true,
  height = 560,
  pageSizeOptions = [10, 25, 50],
  emptyMessage = 'No records found.',
  dataGridProps = {},
  sx,
}) {
  const hasHeader = title || subtitle || (addLabel && onAdd && canAdd);
  const hasFilters = filters || onSearchChange;

  return (
    <Box sx={sx}>
      {hasHeader && (
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
          {(title || subtitle) && (
            <Box>
              {title && <Typography variant="h4" fontWeight={800}>{title}</Typography>}
              {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
            </Box>
          )}
          {addLabel && onAdd && canAdd && <Button variant="contained" startIcon={<Add />} onClick={onAdd}>{addLabel}</Button>}
        </Stack>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {hasFilters && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {onSearchChange && (
              <TextField
                fullWidth
                label="Search"
                value={searchValue || ''}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
              />
            )}
            {filters}
          </Stack>
        </Paper>
      )}
      <Paper sx={{ height, borderRadius: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={pageSizeOptions}
          localeText={{ noRowsLabel: emptyMessage, ...(dataGridProps.localeText || {}) }}
          {...dataGridProps}
        />
      </Paper>
    </Box>
  );
}

export default CommonList;

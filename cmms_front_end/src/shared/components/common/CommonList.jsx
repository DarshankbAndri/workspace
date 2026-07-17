import React from 'react';
import { Box, Paper, Stack, TextField } from '@mui/material';
import { Add } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import CommonEmptyState from './CommonEmptyState';
import CommonErrorState from './CommonErrorState';
import CommonFilterPanel from './CommonFilterPanel';
import CommonPageHeader from './CommonPageHeader';

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
  onRetry,
  headerProps = {},
  tableTestId,
}) {
  const hasHeader = title || subtitle || (addLabel && onAdd && canAdd);
  const hasFilters = filters || onSearchChange;

  return (
    <Box sx={{ minWidth: 0, ...sx }}>
      {hasHeader && (
        <CommonPageHeader
          title={title}
          subtitle={subtitle}
          primaryAction={addLabel && onAdd && canAdd ? {
            label: addLabel,
            icon: <Add />,
            onClick: onAdd,
            'data-testid': 'page-primary-action',
          } : undefined}
          sx={{ mb: 2 }}
          {...headerProps}
        />
      )}
      {error && <CommonErrorState message={error} onRetry={onRetry} />}
      {hasFilters && (
        <CommonFilterPanel sx={{ mb: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {onSearchChange && (
              <TextField
                fullWidth
                label="Search"
                value={searchValue || ''}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                data-testid="list-search-field"
              />
            )}
            {filters}
          </Stack>
        </CommonFilterPanel>
      )}
      <Paper
        elevation={0}
        sx={{
          height: { xs: Math.min(Number(height) || 560, 520), md: height },
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          minWidth: 0,
        }}
        data-testid={tableTestId}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          rowHeight={52}
          columnHeaderHeight={48}
          pageSizeOptions={pageSizeOptions}
          slots={{
            noRowsOverlay: () => <CommonEmptyState title={emptyMessage} sx={{ minHeight: '100%' }} />,
            noResultsOverlay: () => <CommonEmptyState title="No matching records" sx={{ minHeight: '100%' }} />,
            ...(dataGridProps.slots || {}),
          }}
          localeText={{ noRowsLabel: emptyMessage, noResultsOverlayLabel: 'No matching records', ...(dataGridProps.localeText || {}) }}
          {...dataGridProps}
          sx={{
            minWidth: 0,
            '& .MuiDataGrid-cellContent': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
            ...(dataGridProps.sx || {}),
          }}
        />
      </Paper>
    </Box>
  );
}

export default CommonList;

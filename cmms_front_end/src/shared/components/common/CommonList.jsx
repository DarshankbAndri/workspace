import React from 'react';
import { Box, IconButton, Paper, Stack, TextField, Tooltip } from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  rowNavigationPath,
  getRowViewPath,
  onRowView,
  showViewAction = false,
  viewPermission,
  disableRowNavigation = false,
}) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const hasHeader = title || subtitle || (addLabel && onAdd && canAdd);
  const hasFilters = filters || onSearchChange;
  const canView = !viewPermission || hasPermission(viewPermission);
  const resolveViewPath = React.useCallback((row) => {
    if (getRowViewPath) return getRowViewPath(row);
    if (typeof rowNavigationPath === 'function') return rowNavigationPath(row);
    if (rowNavigationPath) return rowNavigationPath.replace(':id', row?.id);
    return '';
  }, [getRowViewPath, rowNavigationPath]);
  const openView = React.useCallback((row) => {
    if (!row || !canView) return;
    if (onRowView) {
      onRowView(row);
      return;
    }
    const path = resolveViewPath(row);
    if (path) navigate(path);
  }, [canView, navigate, onRowView, resolveViewPath]);
  const shouldIgnoreRowClick = (event) => {
    const target = event?.target;
    if (!target?.closest) return false;
    return Boolean(target.closest('button, a, input, textarea, select, [role="button"], [role="menuitem"], .MuiDataGrid-cellCheckbox'));
  };
  const viewColumn = React.useMemo(() => ({
    field: '__viewAction',
    headerName: '',
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    width: 56,
    align: 'center',
    renderCell: ({ row }) => (
      <Tooltip title="View">
        <span>
          <IconButton
            aria-label="View record"
            size="small"
            disabled={!canView}
            onClick={(event) => {
              event.stopPropagation();
              openView(row);
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    ),
  }), [canView, openView]);
  const listColumns = showViewAction ? [viewColumn, ...columns] : columns;
  const commonRowNavigationEnabled = !disableRowNavigation && canView && (onRowView || rowNavigationPath || getRowViewPath);
  const handleRowClick = commonRowNavigationEnabled
    ? (params, event, details) => {
        if (shouldIgnoreRowClick(event)) return;
        if (dataGridProps.onRowClick) {
          dataGridProps.onRowClick(params, event, details);
          return;
        }
        openView(params.row);
      }
    : dataGridProps.onRowClick;
  const mergedSx = {
    minWidth: 0,
    '& .MuiDataGrid-cellContent': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    ...(commonRowNavigationEnabled ? {
      '& .MuiDataGrid-row': {
        cursor: 'pointer',
      },
    } : {}),
    ...(dataGridProps.sx || {}),
  };

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
          columns={listColumns}
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
          onRowClick={handleRowClick}
          sx={mergedSx}
        />
      </Paper>
    </Box>
  );
}

export default CommonList;

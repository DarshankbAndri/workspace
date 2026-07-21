import React from 'react';
import { Box, IconButton, Menu, MenuItem, Paper, Stack, TextField, Tooltip } from '@mui/material';
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
  const [rowMenu, setRowMenu] = React.useState(null);
  const hasHeader = title || subtitle || (addLabel && onAdd && canAdd);
  const hasFilters = filters || onSearchChange;
  const canView = !viewPermission || hasPermission(viewPermission);
  const rowLookup = React.useMemo(() => {
    const getRowId = dataGridProps.getRowId || ((row) => row.id);
    return new Map(rows.map((row) => [String(getRowId(row)), row]));
  }, [dataGridProps.getRowId, rows]);
  const resolveAbsolutePath = React.useCallback((path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    if (typeof window === 'undefined') return path;
    return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
  }, []);
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
  const openViewInNewTab = React.useCallback((row) => {
    if (!row || !canView || onRowView) return;
    const path = resolveViewPath(row);
    const absolutePath = resolveAbsolutePath(path);
    if (absolutePath) window.open(absolutePath, '_blank', 'noopener,noreferrer');
  }, [canView, onRowView, resolveAbsolutePath, resolveViewPath]);
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
        if ((event.ctrlKey || event.metaKey) && !onRowView) {
          openViewInNewTab(params.row);
          return;
        }
        if (dataGridProps.onRowClick) {
          dataGridProps.onRowClick(params, event, details);
          return;
        }
        openView(params.row);
      }
    : dataGridProps.onRowClick;
  const rowSlotProps = dataGridProps.slotProps?.row || {};
  const handleRowContextMenu = commonRowNavigationEnabled && !onRowView
    ? (event) => {
        rowSlotProps.onContextMenu?.(event);
        if (event.defaultPrevented) return;
        if (shouldIgnoreRowClick(event)) {
          return;
        }
        const rowElement = event.currentTarget?.closest?.('[role="row"][data-id]') || event.currentTarget;
        const rowId = rowElement?.getAttribute?.('data-id');
        const row = rowLookup.get(String(rowId));
        const path = resolveViewPath(row);
        if (!path) {
          return;
        }
        event.preventDefault();
        setRowMenu({
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
          row,
        });
      }
    : rowSlotProps.onContextMenu;
  const closeRowMenu = () => setRowMenu(null);
  const openContextRowInNewTab = () => {
    openViewInNewTab(rowMenu?.row);
    closeRowMenu();
  };
  const mergedSlotProps = {
    ...(dataGridProps.slotProps || {}),
    row: {
      ...rowSlotProps,
      onContextMenu: handleRowContextMenu,
    },
  };
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
          slotProps={mergedSlotProps}
          sx={mergedSx}
        />
      </Paper>
      <Menu
        open={Boolean(rowMenu)}
        onClose={closeRowMenu}
        anchorReference="anchorPosition"
        anchorPosition={rowMenu ? { top: rowMenu.mouseY, left: rowMenu.mouseX } : undefined}
      >
        <MenuItem onClick={openContextRowInNewTab}>Open in new tab</MenuItem>
      </Menu>
    </Box>
  );
}

export default CommonList;

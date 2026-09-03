import React from 'react';
import { Alert, Box, Chip, Stack } from '@mui/material';
import { AssignmentTurnedIn } from '@mui/icons-material';
import { searchMyMaintenanceAssignments } from '../services/assignmentService';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../../shared/utils/searchPayload';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonList from '../../../shared/components/common/CommonList';
import CommonPageHeader from '../../../shared/components/common/CommonPageHeader';
import CommonStatusDropdown from '../../../shared/components/common/CommonStatusDropdown';
import { ASSIGNMENT_STATUS_OPTIONS } from '../../../shared/constants/statusOptions';
import { useAuth } from '../../../shared/context/AuthContext';

const statusColors = {
  ASSIGNED: 'info',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const formatApiError = (err, fallback) => {
  const apiError = err.response?.data || err.apiError;
  if (!apiError) return fallback;
  const code = apiError.code ? ` (${apiError.code})` : '';
  const correlation = apiError.correlationId ? ` Correlation: ${apiError.correlationId}` : '';
  return `${apiError.message || fallback}${code}.${correlation}`.trim();
};

function MyMaintenanceAssignmentsPage() {
  const { user } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [status, setStatus] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [rowCount, setRowCount] = React.useState(0);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([]);

  const resetPage = () => setPaginationModel((current) => ({ ...current, page: 0 }));

  const loadRows = React.useCallback(() => {
    setLoading(true);
    setError('');
    const payload = createSearchPayload({
      filters: [
        equalFilter('status', status),
        commonSearchFilter(search),
      ],
      paginationModel,
      sortModel,
    });
    searchMyMaintenanceAssignments(payload)
      .then((page) => {
        setRows(page.data || []);
        setRowCount(page.totalRecords || 0);
      })
      .catch((err) => setError(formatApiError(err, 'Unable to load assigned jobs.')))
      .finally(() => setLoading(false));
  }, [paginationModel, search, sortModel, status]);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput);
      resetPage();
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const updatePaginationModel = (model) => {
    setPaginationModel((current) => ({
      page: model.pageSize !== current.pageSize ? 0 : model.page,
      pageSize: model.pageSize,
    }));
  };

  const columns = [
    { field: 'requestNumber', headerName: 'Request No.', minWidth: 160, flex: 0.8 },
    { field: 'requestTitle', headerName: 'Request', minWidth: 220, flex: 1.2 },
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 180, flex: 0.9 },
    { field: 'siteName', headerName: 'Site', minWidth: 170, flex: 0.8 },
    { field: 'vendorName', headerName: 'Vendor', minWidth: 170, flex: 0.8 },
    { field: 'assignedDate', headerName: 'Assigned', minWidth: 120, flex: 0.6, valueFormatter: ({ value }) => formatDate(value) },
    { field: 'plannedEndDate', headerName: 'Due', minWidth: 120, flex: 0.6, valueFormatter: ({ value }) => formatDate(value) },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 150,
      flex: 0.7,
      renderCell: ({ row }) => {
        const value = row.status || 'ASSIGNED';
        return <Chip size="small" label={value.replaceAll('_', ' ')} color={statusColors[value] || 'default'} />;
      },
    },
  ];

  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'Current user';

  return (
    <Box>
      <CommonPageHeader
        title="My Assignments"
        subtitle={`${displayName}'s assigned maintenance work`}
        sx={{ mb: 2 }}
      >
        <AssignmentTurnedIn color="primary" />
      </CommonPageHeader>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <CommonStatusDropdown
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            resetPage();
          }}
          options={ASSIGNMENT_STATUS_OPTIONS}
          placeholder="All Status"
          clearable
          sx={{ minWidth: 220 }}
        />
        <CommonInput
          label="Search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          fullWidth
        />
      </Stack>

      <CommonList
        rows={rows}
        columns={columns}
        loading={loading}
        emptyMessage="No assigned work found."
        viewPermission="ASSIGNMENT_VIEW"
        getRowViewPath={(row) => `/maintenance/assignments/${row.id}/view`}
        onRetry={loadRows}
        tableTestId="my-assignments-table"
        dataGridProps={{
          paginationMode: 'server',
          sortingMode: 'server',
          rowCount,
          paginationModel,
          onPaginationModelChange: updatePaginationModel,
          sortModel,
          onSortModelChange: (model) => {
            setSortModel(model);
            resetPage();
          },
        }}
      />
    </Box>
  );
}

export default MyMaintenanceAssignmentsPage;

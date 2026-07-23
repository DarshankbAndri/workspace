import React from 'react';
import { Alert, Box, Chip, Stack, Typography } from '@mui/material';
import { AssignmentTurnedIn } from '@mui/icons-material';
import { getMyMaintenanceAssignments } from '../services/assignmentService';
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
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadRows = React.useCallback(() => {
    setLoading(true);
    setError('');
    getMyMaintenanceAssignments()
      .then((data) => setRows(data || []))
      .catch((err) => setError(formatApiError(err, 'Unable to load assigned jobs.')))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadRows(); }, [loadRows]);

  const filteredRows = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus = !status || row.status === status;
      const matchesSearch = !query || [
        row.requestNumber,
        row.requestTitle,
        row.equipmentName,
        row.siteName,
        row.vendorName,
      ].some((value) => String(value || '').toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [rows, search, status]);

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
          onChange={(event) => setStatus(event.target.value)}
          options={ASSIGNMENT_STATUS_OPTIONS}
          placeholder="All Status"
          clearable
          sx={{ minWidth: 220 }}
        />
        <CommonInput
          label="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
        />
      </Stack>

      <CommonList
        rows={filteredRows}
        columns={columns}
        loading={loading}
        emptyMessage="No assigned work found."
        viewPermission="ASSIGNMENT_VIEW"
        getRowViewPath={(row) => `/maintenance/assignments/${row.id}/view`}
        onRetry={loadRows}
        tableTestId="my-assignments-table"
      />
    </Box>
  );
}

export default MyMaintenanceAssignmentsPage;

import React from 'react';
import { Alert, Box, IconButton, Paper, Snackbar, Stack, Tab, Tabs, TextField, Tooltip } from '@mui/material';
import { Archive, DoneAll, OpenInNew, Refresh, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { archiveNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notificationService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import CommonList from '../../../shared/components/common/CommonList';
import CommonPageHeader from '../../../shared/components/common/CommonPageHeader';
import CommonStatusChip from '../../../shared/components/common/CommonStatusChip';
import { formatDateTime } from '../../../shared/utils/formatters';

const notificationTabs = [
  { key: 'all', label: 'All', filter: {} },
  { key: 'unread', label: 'Unread', filter: { status: 'UNREAD' } },
  { key: 'read', label: 'Read', filter: { status: 'READ' } },
  { key: 'archived', label: 'Archived', filter: { status: 'ARCHIVED' } },
  { key: 'pm', label: 'PM', filter: { type: 'PM_DUE_REMINDER' } },
  { key: 'overdue', label: 'Overdue', filter: { type: 'OVERDUE_REQUEST' } },
  { key: 'approval', label: 'Approval', filter: { type: 'APPROVAL_PENDING' } },
  { key: 'high', label: 'High Priority', filter: { priority: 'HIGH' } },
];

function NotificationCenterPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [rowCount, setRowCount] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const activeFilter = React.useMemo(
    () => notificationTabs.find((tab) => tab.key === activeTab)?.filter || {},
    [activeTab]
  );

  const loadRows = React.useCallback(() => {
    setLoading(true);
    getNotifications({
      ...activeFilter,
      search: search || undefined,
      page: paginationModel.page,
      size: paginationModel.pageSize,
    })
      .then((data) => {
        setRows(data?.content || []);
        setRowCount(data?.totalElements || 0);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load notifications.'))
      .finally(() => setLoading(false));
  }, [activeFilter, paginationModel.page, paginationModel.pageSize, search]);

  React.useEffect(() => { loadRows(); }, [loadRows]);

  const changeTab = (event, nextTab) => {
    setActiveTab(nextTab);
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const changeSearch = (event) => {
    setSearch(event.target.value);
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const openNotification = async (row) => {
    try {
      if (row.status === 'UNREAD' && hasPermission(PERMISSIONS.NOTIFICATION_UPDATE)) {
        await markNotificationRead(row.id);
      }
      if (row.targetUrl) {
        navigate(row.targetUrl);
      } else {
        loadRows();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to open notification.');
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setSuccess('Notifications marked as read.');
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update notifications.');
    }
  };

  const archiveRow = async (row) => {
    try {
      await archiveNotification(row.id);
      setSuccess('Notification archived.');
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to archive notification.');
    }
  };

  const columns = [
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: ({ value }) => <CommonStatusChip value={value} />,
    },
    { field: 'type', headerName: 'Type', minWidth: 170, flex: 0.8 },
    { field: 'title', headerName: 'Title', minWidth: 220, flex: 1 },
    { field: 'message', headerName: 'Message', minWidth: 360, flex: 1.6 },
    { field: 'siteName', headerName: 'Site', minWidth: 150, flex: 0.7 },
    { field: 'referenceCode', headerName: 'Reference', minWidth: 150, flex: 0.7 },
    { field: 'priority', headerName: 'Priority', minWidth: 110, flex: 0.5, renderCell: ({ value }) => <CommonStatusChip value={value} /> },
    { field: 'createdAt', headerName: 'Created', minWidth: 180, flex: 0.8, valueFormatter: ({ value }) => formatDateTime(value, '') },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 130,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Open"><IconButton size="small" onClick={() => openNotification(row)}><OpenInNew fontSize="small" /></IconButton></Tooltip>
          {hasPermission(PERMISSIONS.NOTIFICATION_UPDATE) && <Tooltip title="Archive">
            <span>
              <IconButton size="small" onClick={() => archiveRow(row)} disabled={row.status === 'ARCHIVED'}>
                <Archive fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <CommonPageHeader
        title="Notifications"
        subtitle="PM reminders, overdue alerts, and approval updates."
        secondaryActions={[{ label: 'Refresh', icon: <Refresh />, onClick: loadRows }]}
        primaryAction={hasPermission(PERMISSIONS.NOTIFICATION_UPDATE) ? { label: 'Mark All Read', icon: <DoneAll />, onClick: markAllRead } : undefined}
        sx={{ mb: 2 }}
        data-testid="notifications-header"
      />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ borderRadius: 1, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={changeTab}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40 } }}
          >
            {notificationTabs.map((tab) => <Tab key={tab.key} value={tab.key} label={tab.label} />)}
          </Tabs>
          <TextField
            size="small"
            value={search}
            onChange={changeSearch}
            placeholder="Search notifications"
            InputProps={{ startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
            sx={{ width: { xs: '100%', md: 280 } }}
          />
        </Stack>
        <CommonList
            rows={rows}
            columns={columns}
            loading={loading}
            height={620}
            emptyMessage="No notifications found."
            tableTestId="notifications-table"
            dataGridProps={{
              pageSizeOptions: [10, 25, 50],
              paginationMode: 'server',
              rowCount,
              paginationModel,
              onPaginationModelChange: setPaginationModel,
            }}
          />
      </Paper>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} message={success} onClose={() => setSuccess('')} />
    </Box>
  );
}

export default NotificationCenterPage;

import React from 'react';
import { Alert, Box, Button, Chip, IconButton, Paper, Snackbar, Stack, Tooltip, Typography } from '@mui/material';
import { Archive, DoneAll, OpenInNew, Refresh } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { archiveNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notificationService';

function NotificationCenterPage() {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const loadRows = React.useCallback(() => {
    setLoading(true);
    getNotifications()
      .then((data) => setRows(data || []))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load notifications.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadRows(); }, [loadRows]);

  const openNotification = async (row) => {
    try {
      if (row.status === 'UNREAD') {
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
      renderCell: ({ value }) => <Chip size="small" label={value} color={value === 'UNREAD' ? 'primary' : 'default'} />,
    },
    { field: 'type', headerName: 'Type', minWidth: 170, flex: 0.8 },
    { field: 'title', headerName: 'Title', minWidth: 220, flex: 1 },
    { field: 'message', headerName: 'Message', minWidth: 360, flex: 1.6 },
    { field: 'siteName', headerName: 'Site', minWidth: 150, flex: 0.7 },
    { field: 'referenceCode', headerName: 'Reference', minWidth: 150, flex: 0.7 },
    { field: 'priority', headerName: 'Priority', minWidth: 110, flex: 0.5 },
    { field: 'createdAt', headerName: 'Created', minWidth: 180, flex: 0.8, valueFormatter: ({ value }) => value ? new Date(value).toLocaleString() : '' },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 130,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Open"><IconButton size="small" onClick={() => openNotification(row)}><OpenInNew fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Archive"><IconButton size="small" onClick={() => archiveRow(row)}><Archive fontSize="small" /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Notifications</Typography>
          <Typography variant="body2" color="text.secondary">PM reminders, overdue alerts, and approval updates.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadRows}>Refresh</Button>
          <Button variant="contained" startIcon={<DoneAll />} onClick={markAllRead}>Mark All Read</Button>
        </Stack>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ height: 620, borderRadius: 1 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} message={success} onClose={() => setSuccess('')} />
    </Box>
  );
}

export default NotificationCenterPage;

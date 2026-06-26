import React from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, MenuItem, Paper, Snackbar, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Add, Delete, Edit, Visibility } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { deleteDowntimeEntry, getMaintenanceRequests, searchDowntimeEntries } from '../../../services/maintenanceService';
import { getEquipments } from '../../../services/equipmentService';
import { getSites } from '../../../services/siteService';
import { useAuth } from '../../../context/AuthContext';
import { commonSearchFilter, createSearchPayload, equalFilter, rangeFilter } from '../../../utils/searchPayload';

const formatDuration = (value) => value ?? '-';

function DowntimeListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [filters, setFilters] = React.useState({ siteId: '', equipmentId: '', requestId: '', dateFrom: '', dateTo: '', search: '' });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [deleteRow, setDeleteRow] = React.useState(null);
  const [rowCount, setRowCount] = React.useState(0);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([]);

  const loadRows = React.useCallback(() => {
    setLoading(true);
    const payload = createSearchPayload({
      filters: [
        equalFilter('siteId', filters.siteId, 'NUMBER'),
        equalFilter('equipmentId', filters.equipmentId, 'NUMBER'),
        equalFilter('requestId', filters.requestId, 'NUMBER'),
        rangeFilter('downtimeStart', filters.dateFrom ? `${filters.dateFrom}T00:00:00` : '', 'gte', 'DATETIME'),
        rangeFilter('downtimeStart', filters.dateTo ? `${filters.dateTo}T23:59:59` : '', 'lte', 'DATETIME'),
        commonSearchFilter(filters.search),
      ],
      paginationModel,
      sortModel,
    });
    searchDowntimeEntries(payload)
      .then((response) => {
        setRows(response.data || []);
        setRowCount(response.totalRecords || 0);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load downtime.'))
      .finally(() => setLoading(false));
  }, [filters, paginationModel, sortModel]);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    Promise.all([getSites(), getEquipments(), getMaintenanceRequests()])
      .then(([siteRows, equipmentRows, requestRows]) => {
        setSites((siteRows || []).filter((site) => site.status !== 'INACTIVE'));
        setEquipments(equipmentRows || []);
        setRequests(requestRows || []);
      })
      .catch(() => setError('Unable to load filters.'));
  }, []);

  const filteredEquipments = equipments.filter((equipment) => !filters.siteId || String(equipment.siteId || '') === String(filters.siteId));
  const filteredRequests = requests.filter((request) => (
    (!filters.siteId || String(request.siteId || '') === String(filters.siteId)) &&
    (!filters.equipmentId || String(request.equipmentId || '') === String(filters.equipmentId))
  ));

  const updateFilter = (field) => (event) => {
    const value = event.target.value;
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === 'siteId' ? { equipmentId: '', requestId: '' } : {}),
      ...(field === 'equipmentId' ? { requestId: '' } : {}),
    }));
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    try {
      await deleteDowntimeEntry(deleteRow.id);
      setSuccess('Downtime entry deleted.');
      setDeleteRow(null);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete downtime entry.');
    }
  };

  const columns = [
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 190, flex: 1 },
    { field: 'siteName', headerName: 'Site', minWidth: 170, flex: 0.9 },
    { field: 'requestNumber', headerName: 'Request', minWidth: 160, flex: 0.8 },
    { field: 'downtimeStart', headerName: 'Start Time', minWidth: 170, flex: 0.9 },
    { field: 'downtimeEnd', headerName: 'End Time', minWidth: 170, flex: 0.9, valueFormatter: ({ value }) => value || '-' },
    { field: 'downtimeMinutes', headerName: 'Minutes', minWidth: 100, flex: 0.5, valueFormatter: ({ value }) => formatDuration(value) },
    { field: 'downtimeHours', headerName: 'Hours', minWidth: 100, flex: 0.5, valueFormatter: ({ value }) => formatDuration(value) },
    { field: 'reason', headerName: 'Reason', minWidth: 180, flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 140,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          {hasPermission('DOWNTIME_VIEW') && <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/maintenance/downtime/${row.id}/view`)}><Visibility fontSize="small" /></IconButton></Tooltip>}
          {hasPermission('DOWNTIME_UPDATE') && <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/maintenance/downtime/${row.id}/edit`)}><Edit fontSize="small" /></IconButton></Tooltip>}
          {hasPermission('DOWNTIME_DELETE') && <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteRow(row)}><Delete fontSize="small" /></IconButton></Tooltip>}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Equipment Downtime Tracking</Typography>
          <Typography variant="body2" color="text.secondary">Track outage windows and calculated downtime.</Typography>
        </Box>
        {hasPermission('DOWNTIME_CREATE') && <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/maintenance/downtime/new')}>Add Downtime</Button>}
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select label="Site" value={filters.siteId} onChange={updateFilter('siteId')} sx={{ minWidth: 220 }}>
            <MenuItem value="">All Sites</MenuItem>
            {sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}
          </TextField>
          <TextField select label="Equipment" value={filters.equipmentId} onChange={updateFilter('equipmentId')} sx={{ minWidth: 220 }}>
            <MenuItem value="">All Equipment</MenuItem>
            {filteredEquipments.map((item) => <MenuItem key={item.id} value={item.id}>{item.equipmentCode} - {item.equipmentName}</MenuItem>)}
          </TextField>
          <TextField select label="Request" value={filters.requestId} onChange={updateFilter('requestId')} sx={{ minWidth: 220 }}>
            <MenuItem value="">All Requests</MenuItem>
            {filteredRequests.map((item) => <MenuItem key={item.id} value={item.id}>{item.requestNumber} - {item.title}</MenuItem>)}
          </TextField>
          <TextField type="date" label="Date From" value={filters.dateFrom} onChange={updateFilter('dateFrom')} InputLabelProps={{ shrink: true }} sx={{ minWidth: 170 }} />
          <TextField type="date" label="Date To" value={filters.dateTo} onChange={updateFilter('dateTo')} InputLabelProps={{ shrink: true }} sx={{ minWidth: 170 }} />
          <TextField label="Search" value={filters.search} onChange={updateFilter('search')} fullWidth />
        </Stack>
      </Paper>
      <Paper sx={{ height: 560, borderRadius: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          paginationMode="server"
          sortingMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => setPaginationModel((current) => (model.pageSize !== current.pageSize ? { ...model, page: 0 } : model))}
          sortModel={sortModel}
          onSortModelChange={(model) => {
            setSortModel(model);
            setPaginationModel((current) => ({ ...current, page: 0 }));
          }}
        />
      </Paper>
      <Dialog open={Boolean(deleteRow)} onClose={() => setDeleteRow(null)}>
        <DialogTitle>Delete downtime entry?</DialogTitle>
        <DialogContent><DialogContentText>This will delete downtime for {deleteRow?.equipmentName || 'this equipment'}.</DialogContentText></DialogContent>
        <DialogActions><Button onClick={() => setDeleteRow(null)}>Cancel</Button><Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button></DialogActions>
      </Dialog>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess('')} message={success} />
    </Box>
  );
}

export default DowntimeListPage;

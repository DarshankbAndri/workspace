import React from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, LinearProgress, MenuItem, Paper, Snackbar, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Add, AddTask, Delete, Edit, PlayArrow, Visibility } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { getEquipments } from '../../../services/equipmentService';
import { getSites } from '../../../services/siteService';
import { deletePMSchedule, generateDuePMWorkOrders, generatePMWorkOrder, searchPMSchedules } from '../../../services/preventiveMaintenanceService';
import { useAuth } from '../../../context/AuthContext';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../../utils/searchPayload';

const frequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const formatPercent = (value) => Number(value || 0).toFixed(2);

function PreventiveMaintenanceListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [rows, setRows] = React.useState([]);
  const [sites, setSites] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [filters, setFilters] = React.useState({ siteId: '', equipmentId: '', frequency: '', priority: '', active: '', search: '' });
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
        equalFilter('frequency', filters.frequency),
        equalFilter('priority', filters.priority),
        equalFilter('active', filters.active, 'BOOLEAN'),
        commonSearchFilter(filters.search),
      ],
      paginationModel,
      sortModel,
    });
    searchPMSchedules(payload)
      .then((response) => {
        setRows(response.data || []);
        setRowCount(response.totalRecords || 0);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load preventive maintenance schedules.'))
      .finally(() => setLoading(false));
  }, [filters, paginationModel, sortModel]);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    Promise.all([getSites(), getEquipments()])
      .then(([siteRows, equipmentRows]) => {
        setSites((siteRows || []).filter((site) => site.status !== 'INACTIVE'));
        setEquipments(equipmentRows || []);
      })
      .catch(() => setError('Unable to load filters.'));
  }, []);

  const filteredEquipments = equipments.filter((equipment) => !filters.siteId || String(equipment.siteId || '') === String(filters.siteId));
  const updateFilter = (field) => (event) => {
    const value = event.target.value;
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === 'siteId' ? { equipmentId: '' } : {}),
    }));
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    try {
      await deletePMSchedule(deleteRow.id);
      setSuccess('PM schedule deleted.');
      setDeleteRow(null);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete PM schedule.');
    }
  };

  const handleGenerate = async (row) => {
    setError('');
    setSuccess('');
    try {
      await generatePMWorkOrder(row.id);
      setSuccess('Work order generated and vendor notification recorded.');
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate work order.');
    }
  };

  const handleGenerateDue = async () => {
    setError('');
    setSuccess('');
    try {
      const generated = await generateDuePMWorkOrders();
      setSuccess(`${generated.length} due work order${generated.length === 1 ? '' : 's'} generated.`);
      loadRows();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to generate due work orders.');
    }
  };

  const columns = [
    { field: 'scheduleCode', headerName: 'Schedule', minWidth: 180, flex: 0.9 },
    { field: 'siteName', headerName: 'Site', minWidth: 160, flex: 0.8 },
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 190, flex: 1 },
    { field: 'title', headerName: 'PM Task', minWidth: 220, flex: 1.2 },
    { field: 'frequency', headerName: 'Frequency', minWidth: 130, flex: 0.6 },
    { field: 'priority', headerName: 'Priority', minWidth: 120, flex: 0.6 },
    { field: 'nextDueDate', headerName: 'Next Due', minWidth: 130, flex: 0.6 },
    { field: 'vendorName', headerName: 'Vendor', minWidth: 180, flex: 0.9, valueFormatter: ({ value }) => value || '-' },
    {
      field: 'completionPercentage',
      headerName: 'Completion',
      minWidth: 150,
      flex: 0.8,
      renderCell: ({ row }) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant="caption" fontWeight={700}>{formatPercent(row.completionPercentage)}%</Typography>
          <LinearProgress variant="determinate" value={Number(row.completionPercentage || 0)} sx={{ height: 6, borderRadius: 1 }} />
        </Box>
      ),
    },
    { field: 'generatedWorkOrders', headerName: 'WOs', minWidth: 90, flex: 0.4 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 180,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          {hasPermission('REQUEST_CREATE') && <Tooltip title="Generate work order"><IconButton size="small" color="primary" onClick={() => handleGenerate(row)}><PlayArrow fontSize="small" /></IconButton></Tooltip>}
          {hasPermission('REQUEST_VIEW') && <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/maintenance/preventive/${row.id}/view`)}><Visibility fontSize="small" /></IconButton></Tooltip>}
          {hasPermission('REQUEST_UPDATE') && <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/maintenance/preventive/${row.id}/edit`)}><Edit fontSize="small" /></IconButton></Tooltip>}
          {hasPermission('REQUEST_DELETE') && <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteRow(row)}><Delete fontSize="small" /></IconButton></Tooltip>}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Preventive Maintenance</Typography>
          <Typography variant="body2" color="text.secondary">Schedule recurring maintenance and generate work orders for assigned vendors.</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {hasPermission('REQUEST_CREATE') && <Button variant="outlined" startIcon={<AddTask />} onClick={handleGenerateDue}>Generate Due Work Orders</Button>}
          {hasPermission('REQUEST_CREATE') && <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/maintenance/preventive/new')}>Add PM Schedule</Button>}
        </Stack>
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
          <TextField select label="Frequency" value={filters.frequency} onChange={updateFilter('frequency')} sx={{ minWidth: 170 }}>
            <MenuItem value="">All Frequency</MenuItem>
            {frequencies.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
          <TextField select label="Priority" value={filters.priority} onChange={updateFilter('priority')} sx={{ minWidth: 170 }}>
            <MenuItem value="">All Priority</MenuItem>
            {priorities.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
          <TextField select label="Status" value={filters.active} onChange={updateFilter('active')} sx={{ minWidth: 150 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>
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
        <DialogTitle>Delete PM schedule?</DialogTitle>
        <DialogContent><DialogContentText>This will delete {deleteRow?.scheduleCode || deleteRow?.title}.</DialogContentText></DialogContent>
        <DialogActions><Button onClick={() => setDeleteRow(null)}>Cancel</Button><Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button></DialogActions>
      </Dialog>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess('')} message={success} />
    </Box>
  );
}

export default PreventiveMaintenanceListPage;

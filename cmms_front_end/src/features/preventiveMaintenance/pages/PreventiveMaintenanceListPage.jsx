import React from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, LinearProgress, Paper, Snackbar, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Add, AddTask, CalendarMonth, Delete, PlayArrow } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getEquipments } from '../../equipment/services/equipmentService';
import { getSites } from '../../site/services/siteService';
import { deletePMSchedule, generateDuePMWorkOrders, generatePMWorkOrder, searchPMSchedules } from '../services/preventiveMaintenanceService';
import { useAuth } from '../../../shared/context/AuthContext';
import { commonSearchFilter, createSearchPayload, equalFilter } from '../../../shared/utils/searchPayload';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonList from '../../../shared/components/common/CommonList';
import CommonStatusDropdown from '../../../shared/components/common/CommonStatusDropdown';
import { BOOLEAN_ACTIVE_STATUS_OPTIONS, CRITICALITY_PRIORITY_OPTIONS, PM_FREQUENCY_OPTIONS } from '../../../shared/constants/statusOptions';

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
    { field: 'status', headerName: 'Approval Status', minWidth: 150, flex: 0.7, valueFormatter: ({ value }) => value || 'ACTIVE' },
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
      headerName: '',
      sortable: false,
      filterable: false,
      width: 110,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          {hasPermission('REQUEST_CREATE') && (
            <Tooltip title="Generate work order">
              <IconButton
                size="small"
                color="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  handleGenerate(row);
                }}
              >
                <PlayArrow fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {hasPermission('REQUEST_DELETE') && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteRow(row);
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
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
          {hasPermission('PM_CALENDAR_VIEW') && <Button variant="outlined" startIcon={<CalendarMonth />} onClick={() => navigate('/maintenance/preventive/calendar')}>Calendar</Button>}
          {hasPermission('REQUEST_CREATE') && <Button variant="outlined" startIcon={<AddTask />} onClick={handleGenerateDue}>Generate Due Work Orders</Button>}
          {hasPermission('REQUEST_CREATE') && <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/maintenance/preventive/new')}>Add PM Schedule</Button>}
        </Stack>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <CommonDropdown
            label="Site"
            value={filters.siteId}
            onChange={updateFilter('siteId')}
            options={sites}
            placeholder="All Sites"
            clearable
            getOptionLabel={(site) => `${site.siteName} (${site.siteCode})`}
            getOptionValue={(site) => site.id}
            sx={{ minWidth: 220 }}
          />
          <CommonDropdown
            label="Equipment"
            value={filters.equipmentId}
            onChange={updateFilter('equipmentId')}
            options={filteredEquipments}
            placeholder="All Equipment"
            clearable
            getOptionLabel={(item) => `${item.equipmentCode} - ${item.equipmentName}`}
            getOptionValue={(item) => item.id}
            sx={{ minWidth: 220 }}
          />
          <CommonDropdown label="Frequency" value={filters.frequency} onChange={updateFilter('frequency')} options={PM_FREQUENCY_OPTIONS} placeholder="All Frequency" clearable sx={{ minWidth: 170 }} />
          <CommonDropdown label="Priority" value={filters.priority} onChange={updateFilter('priority')} options={CRITICALITY_PRIORITY_OPTIONS} placeholder="All Priority" clearable sx={{ minWidth: 170 }} />
          <CommonStatusDropdown value={filters.active} onChange={updateFilter('active')} options={BOOLEAN_ACTIVE_STATUS_OPTIONS} sx={{ minWidth: 150 }} />
          <TextField label="Search" value={filters.search} onChange={updateFilter('search')} fullWidth />
        </Stack>
      </Paper>
      <CommonList
        rows={rows}
        columns={columns}
        loading={loading}
        dataGridProps={{
          paginationMode: 'server',
          sortingMode: 'server',
          rowCount,
          paginationModel,
          onPaginationModelChange: (model) => setPaginationModel((current) => (model.pageSize !== current.pageSize ? { ...model, page: 0 } : model)),
          sortModel,
          onSortModelChange: (model) => {
            setSortModel(model);
            setPaginationModel((current) => ({ ...current, page: 0 }));
          },
          onRowClick: ({ row }) => navigate(`/maintenance/preventive/${row.id}/view`),
          sx: {
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          },
        }}
      />
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

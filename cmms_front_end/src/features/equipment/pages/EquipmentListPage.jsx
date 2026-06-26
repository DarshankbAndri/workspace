import React from 'react';
import { Box, Button, IconButton, MenuItem, Paper, Stack, TextField, Typography, Alert } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { deleteEquipment, searchEquipments } from '../services/equipmentService';
import { getSites } from '../../site/services/siteService';

function EquipmentListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [rowCount, setRowCount] = React.useState(0);
  const [sites, setSites] = React.useState([]);
  const [siteFilter, setSiteFilter] = React.useState('');
  const [equipmentNameFilter, setEquipmentNameFilter] = React.useState('');
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadRows = React.useCallback(() => {
    setLoading(true);
    setError('');
    const searchCriteriaList = [];
    if (siteFilter) {
      searchCriteriaList.push({
        filterKey: 'siteId',
        dataType: 'LONG',
        value: siteFilter,
        operation: 'equal',
      });
    }
    if (equipmentNameFilter.trim()) {
      searchCriteriaList.push({
        filterKey: 'commonSearch',
        dataType: 'VARCHAR',
        value: equipmentNameFilter.trim(),
        operation: 'contains',
      });
    }
    const activeSort = sortModel[0];
    searchEquipments({
      searchCriteriaList,
      dataOption: 'all',
      pagination: {
        status: 'ON',
        recordsPerPage: paginationModel.pageSize,
        sortBy: activeSort?.field || null,
        sortMode: activeSort?.sort ? activeSort.sort.toUpperCase() : null,
        pageNumber: paginationModel.page,
        pageSize: 0,
      },
    })
      .then((response) => {
        setRows(response.data || []);
        setRowCount(response.totalRecords || 0);
      })
      .catch(() => setError('Unable to load equipment.'))
      .finally(() => setLoading(false));
  }, [equipmentNameFilter, paginationModel.page, paginationModel.pageSize, siteFilter, sortModel]);

  React.useEffect(() => { loadRows(); }, [loadRows]);
  React.useEffect(() => {
    getSites().then((data) => setSites(data.filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this equipment?')) return;
    try {
      await deleteEquipment(id);
      loadRows();
    } catch {
      setError('Unable to delete equipment.');
    }
  };

  const updateSiteFilter = (event) => {
    setSiteFilter(event.target.value);
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const updateEquipmentNameFilter = (event) => {
    setEquipmentNameFilter(event.target.value);
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const updatePaginationModel = (model) => {
    setPaginationModel((current) => ({
      page: model.pageSize !== current.pageSize ? 0 : model.page,
      pageSize: model.pageSize,
    }));
  };

  const columns = [
    { field: 'equipmentCode', headerName: 'Code', minWidth: 120, flex: 0.7 },
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 180, flex: 1.2 },
    { field: 'siteName', headerName: 'Site', minWidth: 180, flex: 1 },
    { field: 'category', headerName: 'Category', minWidth: 120, flex: 0.8 },
    { field: 'location', headerName: 'Location', minWidth: 130, flex: 0.8 },
    { field: 'status', headerName: 'Status', minWidth: 110, flex: 0.6 },
    { field: 'criticality', headerName: 'Criticality', minWidth: 120, flex: 0.7 },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 110,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton aria-label="Edit equipment" onClick={() => navigate(`/equipment/${row.id}`)}><Edit fontSize="small" /></IconButton>
          <IconButton aria-label="Delete equipment" color="error" onClick={() => handleDelete(row.id)}><Delete fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Equipment</Typography>
          <Typography variant="body2" color="text.secondary">Maintain plant assets and operating status.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/equipment/new')}>Add Equipment</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Equipment" value={equipmentNameFilter} onChange={updateEquipmentNameFilter} sx={{ minWidth: { xs: '100%', sm: 280 } }} />
          <TextField select label="Site" value={siteFilter} onChange={updateSiteFilter} sx={{ minWidth: { xs: '100%', sm: 280 } }}>
            <MenuItem value="">All Sites</MenuItem>
            {sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName} ({site.siteCode})</MenuItem>)}
          </TextField>
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
          onPaginationModelChange={updatePaginationModel}
          sortModel={sortModel}
          onSortModelChange={(model) => {
            setSortModel(model);
            setPaginationModel((current) => ({ ...current, page: 0 }));
          }}
        />
      </Paper>
    </Box>
  );
}

export default EquipmentListPage;

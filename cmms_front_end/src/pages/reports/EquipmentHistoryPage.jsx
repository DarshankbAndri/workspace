import React from 'react';
import { Alert, Box, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getEquipments } from '../../services/equipmentService';
import { getEquipmentHistoryReport } from '../../services/reportService';

function EquipmentHistoryPage() {
  const [equipmentId, setEquipmentId] = React.useState('');
  const [equipments, setEquipments] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [rowCount, setRowCount] = React.useState(0);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    getEquipments()
      .then(setEquipments)
      .catch(() => setError('Unable to load equipment filter options.'));
  }, []);

  React.useEffect(() => {
    setLoading(true);
    getEquipmentHistoryReport({
      equipmentId: equipmentId || undefined,
      page: paginationModel.page,
      size: paginationModel.pageSize,
    })
      .then((page) => {
        setRows(page.data || []);
        setRowCount(page.totalRecords || 0);
      })
      .catch(() => setError('Unable to load equipment history.'))
      .finally(() => setLoading(false));
  }, [equipmentId, paginationModel.page, paginationModel.pageSize]);

  const updateEquipment = (event) => {
    setEquipmentId(event.target.value);
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const columns = [
    { field: 'type', headerName: 'Type', minWidth: 130, flex: 0.7 },
    { field: 'reference', headerName: 'Reference', minWidth: 180, flex: 1 },
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 200, flex: 1 },
    { field: 'siteName', headerName: 'Site', minWidth: 170, flex: 0.8 },
    { field: 'detail', headerName: 'Detail', minWidth: 240, flex: 1.4 },
    { field: 'status', headerName: 'Status', minWidth: 140, flex: 0.8 },
    { field: 'date', headerName: 'Date', minWidth: 170, flex: 0.9 },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800}>Equipment History</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Review requests, assignments, and downtime events by equipment.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField select label="Equipment" value={equipmentId} onChange={updateEquipment} sx={{ minWidth: 320, mb: 2 }} size="small">
        <MenuItem value="">All equipment</MenuItem>
        {equipments.map((item) => <MenuItem key={item.id} value={item.id}>{item.equipmentCode} - {item.equipmentName}</MenuItem>)}
      </TextField>
      <Paper sx={{ height: 560, borderRadius: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Paper>
    </Box>
  );
}

export default EquipmentHistoryPage;

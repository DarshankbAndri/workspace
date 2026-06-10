import React from 'react';
import { Alert, Box, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getEquipments } from '../../services/equipmentService';
import { getDowntimeEntries, getMaintenanceAssignments, getMaintenanceRequests } from '../../services/maintenanceService';

function EquipmentHistoryPage() {
  const [equipmentId, setEquipmentId] = React.useState('');
  const [equipments, setEquipments] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    Promise.all([getEquipments(), getMaintenanceRequests(), getMaintenanceAssignments(), getDowntimeEntries()])
      .then(([equipmentRows, requests, assignments, downtimes]) => {
        setEquipments(equipmentRows);
        const historyRows = [
          ...requests.map((item) => ({ id: `REQ-${item.id}`, equipmentId: item.equipmentId, type: 'Request', reference: item.requestNumber, detail: item.title, status: item.status, date: item.requestedDate })),
          ...assignments.map((item) => {
            const request = requests.find((requestItem) => requestItem.id === item.requestId);
            return { id: `ASN-${item.id}`, equipmentId: request?.equipmentId, type: 'Assignment', reference: item.requestNumber, detail: item.assignedTo, status: item.status, date: item.assignedDate };
          }),
          ...downtimes.map((item) => ({ id: `DT-${item.id}`, equipmentId: item.equipmentId, type: 'Downtime', reference: item.requestNumber || '-', detail: item.reason, status: `${item.downtimeHours || 0} hours`, date: item.downtimeStart })),
        ];
        setRows(historyRows);
      })
      .catch(() => setError('Unable to load equipment history.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = equipmentId ? rows.filter((row) => Number(row.equipmentId) === Number(equipmentId)) : rows;
  const columns = [
    { field: 'type', headerName: 'Type', minWidth: 130, flex: 0.7 },
    { field: 'reference', headerName: 'Reference', minWidth: 180, flex: 1 },
    { field: 'detail', headerName: 'Detail', minWidth: 240, flex: 1.4 },
    { field: 'status', headerName: 'Status', minWidth: 140, flex: 0.8 },
    { field: 'date', headerName: 'Date', minWidth: 170, flex: 0.9 },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800}>Equipment History</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Review requests, assignments, and downtime events by equipment.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField select label="Equipment" value={equipmentId} onChange={(event) => setEquipmentId(event.target.value)} sx={{ minWidth: 320, mb: 2 }} size="small">
        <MenuItem value="">All equipment</MenuItem>
        {equipments.map((item) => <MenuItem key={item.id} value={item.id}>{item.equipmentCode} - {item.equipmentName}</MenuItem>)}
      </TextField>
      <Paper sx={{ height: 560, borderRadius: 1 }}>
        <DataGrid rows={filteredRows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>
    </Box>
  );
}

export default EquipmentHistoryPage;

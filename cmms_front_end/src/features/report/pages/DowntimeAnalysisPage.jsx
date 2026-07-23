import React from 'react';
import { Alert, Box, Grid, Paper, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import { getEquipments } from '../../equipment/services/equipmentService';
import { getDowntimeAnalysisReport } from '../services/reportService';

function DowntimeAnalysisPage() {
  const [equipmentId, setEquipmentId] = React.useState('');
  const [equipments, setEquipments] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [rowCount, setRowCount] = React.useState(0);
  const [summary, setSummary] = React.useState({ events: 0, unplannedEvents: 0, totalHours: 0, totalMinutes: 0 });
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const equipmentOptions = React.useMemo(() => [
    { value: '', label: 'All equipment' },
    ...equipments.map((item) => ({ value: item.id, label: `${item.equipmentCode} - ${item.equipmentName}` })),
  ], [equipments]);

  React.useEffect(() => {
    getEquipments()
      .then(setEquipments)
      .catch(() => setError('Unable to load equipment filter options.'));
  }, []);

  React.useEffect(() => {
    setLoading(true);
    getDowntimeAnalysisReport({
      equipmentId: equipmentId || undefined,
      page: paginationModel.page,
      size: paginationModel.pageSize,
    })
      .then((response) => {
        setRows(response.page?.data || []);
        setRowCount(response.page?.totalRecords || 0);
        setSummary(response.summary || { events: 0, unplannedEvents: 0, totalHours: 0, totalMinutes: 0 });
      })
      .catch(() => setError('Unable to load downtime analysis.'))
      .finally(() => setLoading(false));
  }, [equipmentId, paginationModel.page, paginationModel.pageSize]);

  const updateEquipment = (event) => {
    setEquipmentId(event.target.value);
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const columns = [
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 220, flex: 1.4 },
    { field: 'siteName', headerName: 'Site', minWidth: 170, flex: 0.8 },
    { field: 'events', headerName: 'Events', minWidth: 110, flex: 0.6 },
    { field: 'plannedEvents', headerName: 'Planned', minWidth: 110, flex: 0.6 },
    { field: 'unplannedEvents', headerName: 'Unplanned', minWidth: 120, flex: 0.6 },
    { field: 'totalMinutes', headerName: 'Total Minutes', minWidth: 150, flex: 0.7 },
    { field: 'totalHours', headerName: 'Total Hours', minWidth: 140, flex: 0.7 },
    { field: 'totalDays', headerName: 'Total Days', minWidth: 130, flex: 0.7 },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800}>Downtime Analysis</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Summarize downtime frequency and duration by equipment.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <CommonDropdown label="Equipment" value={equipmentId} options={equipmentOptions} onChange={updateEquipment} sx={{ minWidth: 320, mb: 2 }} size="small" />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}><Paper sx={{ p: 2, borderRadius: 1 }}><Typography variant="body2" color="text.secondary">Downtime Events</Typography><Typography variant="h4" fontWeight={800}>{summary.events || 0}</Typography></Paper></Grid>
        <Grid item xs={12} md={4}><Paper sx={{ p: 2, borderRadius: 1 }}><Typography variant="body2" color="text.secondary">Unplanned Events</Typography><Typography variant="h4" fontWeight={800}>{summary.unplannedEvents || 0}</Typography></Paper></Grid>
        <Grid item xs={12} md={4}><Paper sx={{ p: 2, borderRadius: 1 }}><Typography variant="body2" color="text.secondary">Total Hours</Typography><Typography variant="h4" fontWeight={800}>{summary.totalHours || 0}</Typography><Typography variant="caption" color="text.secondary">{summary.totalMinutes || 0} minutes</Typography></Paper></Grid>
      </Grid>
      <Paper sx={{ height: 520, borderRadius: 1 }}>
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

export default DowntimeAnalysisPage;

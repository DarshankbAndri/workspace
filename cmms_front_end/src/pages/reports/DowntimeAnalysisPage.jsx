import React from 'react';
import { Alert, Box, Grid, Paper, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getDowntimeEntries } from '../../services/maintenanceService';

const getDowntimeMinutes = (item) => {
  if (item.downtimeMinutes !== null && item.downtimeMinutes !== undefined) {
    return Number(item.downtimeMinutes || 0);
  }
  return Math.round(Number(item.downtimeHours || 0) * 60);
};

function DowntimeAnalysisPage() {
  const [rows, setRows] = React.useState([]);
  const [summaryRows, setSummaryRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    getDowntimeEntries()
      .then((data) => {
        setRows(data);
        const grouped = data.reduce((acc, item) => {
          const key = item.equipmentId;
          const current = acc[key] || { id: key, equipmentName: item.equipmentName, events: 0, totalMinutes: 0, totalHours: 0, totalDays: 0, plannedEvents: 0 };
          current.events += 1;
          current.totalMinutes += getDowntimeMinutes(item);
          current.totalHours = current.totalMinutes / 60;
          current.totalDays = current.totalMinutes / 1440;
          current.plannedEvents += item.planned ? 1 : 0;
          acc[key] = current;
          return acc;
        }, {});
        setSummaryRows(Object.values(grouped).map((item) => ({
          ...item,
          totalHours: item.totalHours.toFixed(2),
          totalDays: item.totalDays.toFixed(2),
        })));
      })
      .catch(() => setError('Unable to load downtime analysis.'))
      .finally(() => setLoading(false));
  }, []);

  const totalMinutes = rows.reduce((sum, item) => sum + getDowntimeMinutes(item), 0);
  const totalHours = (totalMinutes / 60).toFixed(2);
  const unplanned = rows.filter((item) => !item.planned).length;

  const columns = [
    { field: 'equipmentName', headerName: 'Equipment', minWidth: 220, flex: 1.4 },
    { field: 'events', headerName: 'Events', minWidth: 110, flex: 0.6 },
    { field: 'plannedEvents', headerName: 'Planned', minWidth: 110, flex: 0.6 },
    { field: 'totalMinutes', headerName: 'Total Minutes', minWidth: 150, flex: 0.7 },
    { field: 'totalHours', headerName: 'Total Hours', minWidth: 140, flex: 0.7 },
    { field: 'totalDays', headerName: 'Total Days', minWidth: 130, flex: 0.7 },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800}>Downtime Analysis</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Summarize downtime frequency and duration by equipment.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}><Paper sx={{ p: 2, borderRadius: 1 }}><Typography variant="body2" color="text.secondary">Downtime Events</Typography><Typography variant="h4" fontWeight={800}>{rows.length}</Typography></Paper></Grid>
        <Grid item xs={12} md={4}><Paper sx={{ p: 2, borderRadius: 1 }}><Typography variant="body2" color="text.secondary">Unplanned Events</Typography><Typography variant="h4" fontWeight={800}>{unplanned}</Typography></Paper></Grid>
        <Grid item xs={12} md={4}><Paper sx={{ p: 2, borderRadius: 1 }}><Typography variant="body2" color="text.secondary">Total Hours</Typography><Typography variant="h4" fontWeight={800}>{totalHours}</Typography><Typography variant="caption" color="text.secondary">{totalMinutes} minutes</Typography></Paper></Grid>
      </Grid>
      <Paper sx={{ height: 520, borderRadius: 1 }}>
        <DataGrid rows={summaryRows} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Paper>
    </Box>
  );
}

export default DowntimeAnalysisPage;

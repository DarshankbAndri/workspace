import React from 'react';
import { Alert, Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getEquipments } from '../../equipment/services/equipmentService';
import { getSites } from '../../site/services/siteService';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import {
  getEquipmentCostByCategoryReport,
  getEquipmentCostByCriticalityReport,
  getEquipmentCostBySiteReport,
  getEquipmentMaintenanceCostReport,
} from '../services/reportService';

const REPORT_MODES = [
  { value: 'equipment', label: 'Equipment Maintenance Cost' },
  { value: 'site', label: 'Cost by Site' },
  { value: 'category', label: 'Cost by Category' },
  { value: 'criticality', label: 'Cost by Criticality' },
];

function EquipmentCostReportPage() {
  const [mode, setMode] = React.useState('equipment');
  const [siteId, setSiteId] = React.useState('');
  const [equipmentId, setEquipmentId] = React.useState('');
  const [sites, setSites] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [rowCount, setRowCount] = React.useState(0);
  const [summary, setSummary] = React.useState({});
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    Promise.all([getSites(), getEquipments()])
      .then(([siteData, equipmentData]) => {
        setSites(siteData || []);
        setEquipments(equipmentData || []);
      })
      .catch(() => setError('Unable to load report filter options.'));
  }, []);

  React.useEffect(() => {
    setLoading(true);
    setError('');
    reportLoader(mode)({
      siteId: siteId || undefined,
      equipmentId: mode === 'equipment' && equipmentId ? equipmentId : undefined,
      page: paginationModel.page,
      size: paginationModel.pageSize,
    })
      .then((response) => {
        setRows(response.page?.data || []);
        setRowCount(response.page?.totalRecords || 0);
        setSummary(response.summary || {});
      })
      .catch(() => setError('Unable to load equipment cost report.'))
      .finally(() => setLoading(false));
  }, [mode, siteId, equipmentId, paginationModel.page, paginationModel.pageSize]);

  const siteOptions = React.useMemo(() => [
    { value: '', label: 'All sites' },
    ...sites.map((site) => ({ value: site.id, label: `${site.siteName} (${site.siteCode})` })),
  ], [sites]);

  const equipmentOptions = React.useMemo(() => [
    { value: '', label: 'All equipment' },
    ...equipments
      .filter((item) => !siteId || String(item.siteId) === String(siteId))
      .map((item) => ({ value: item.id, label: `${item.equipmentCode} - ${item.equipmentName}` })),
  ], [equipments, siteId]);

  const updateMode = (event) => {
    setMode(event.target.value);
    setEquipmentId('');
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const updateFilter = (setter) => (event) => {
    setter(event.target.value);
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const columns = mode === 'equipment' ? equipmentColumns : groupedColumns;

  return (
    <Box>
      <Typography variant="h4" fontWeight={800}>Equipment Cost Report</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Track purchase, maintenance, spare/material, downtime, and total ownership cost.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <CommonDropdown label="Report" value={mode} onChange={updateMode} options={REPORT_MODES} sx={{ minWidth: 280 }} size="small" />
        <CommonDropdown label="Site" value={siteId} onChange={updateFilter(setSiteId)} options={siteOptions} sx={{ minWidth: 280 }} size="small" clearable />
        {mode === 'equipment' && (
          <CommonDropdown label="Equipment" value={equipmentId} onChange={updateFilter(setEquipmentId)} options={equipmentOptions} sx={{ minWidth: 320 }} size="small" clearable />
        )}
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={2.4}><SummaryMetric label="Assets" value={summary.assetCount || 0} /></Grid>
        <Grid item xs={12} md={2.4}><SummaryMetric label="Purchase" value={formatMoney(summary.purchaseCost)} /></Grid>
        <Grid item xs={12} md={2.4}><SummaryMetric label="Maintenance" value={formatMoney(summary.maintenanceCost)} /></Grid>
        <Grid item xs={12} md={2.4}><SummaryMetric label="Spare/Material" value={formatMoney(summary.spareMaterialCost)} /></Grid>
        <Grid item xs={12} md={2.4}><SummaryMetric label="TCO" value={formatMoney(summary.totalCostOfOwnership)} /></Grid>
      </Grid>

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

const moneyColumn = (field, headerName) => ({
  field,
  headerName,
  minWidth: 150,
  flex: 0.75,
  valueFormatter: ({ value }) => formatMoney(value),
});

const equipmentColumns = [
  { field: 'equipmentName', headerName: 'Equipment', minWidth: 220, flex: 1.2 },
  { field: 'siteName', headerName: 'Site', minWidth: 160, flex: 0.8 },
  { field: 'assetNumber', headerName: 'Asset No.', minWidth: 140, flex: 0.65 },
  { field: 'category', headerName: 'Category', minWidth: 140, flex: 0.65 },
  { field: 'criticality', headerName: 'Criticality', minWidth: 130, flex: 0.6 },
  moneyColumn('purchaseCost', 'Purchase'),
  moneyColumn('maintenanceCost', 'Maintenance'),
  moneyColumn('spareMaterialCost', 'Spare/Material'),
  moneyColumn('downtimeCost', 'Downtime'),
  moneyColumn('totalCostOfOwnership', 'TCO'),
];

const groupedColumns = [
  { field: 'groupName', headerName: 'Group', minWidth: 240, flex: 1.2 },
  { field: 'assetCount', headerName: 'Assets', minWidth: 110, flex: 0.5 },
  moneyColumn('purchaseCost', 'Purchase'),
  moneyColumn('maintenanceCost', 'Maintenance'),
  moneyColumn('spareMaterialCost', 'Spare/Material'),
  moneyColumn('downtimeCost', 'Downtime'),
  moneyColumn('totalCostOfOwnership', 'TCO'),
];

function reportLoader(mode) {
  if (mode === 'site') return getEquipmentCostBySiteReport;
  if (mode === 'category') return getEquipmentCostByCategoryReport;
  if (mode === 'criticality') return getEquipmentCostByCriticalityReport;
  return getEquipmentMaintenanceCostReport;
}

function SummaryMetric({ label, value }) {
  return (
    <Paper sx={{ p: 2, borderRadius: 1 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h5" fontWeight={800}>{value || '-'}</Typography>
    </Paper>
  );
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '0.00';
  const number = Number(value);
  if (!Number.isFinite(number)) return '0.00';
  return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default EquipmentCostReportPage;

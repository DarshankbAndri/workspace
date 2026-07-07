import React from 'react';
import { Alert, Box, Button, Chip, Grid, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getEquipmentById, getEquipmentSummary } from '../services/equipmentService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

function EquipmentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [equipment, setEquipment] = React.useState(null);
  const [summary, setSummary] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([getEquipmentById(id), getEquipmentSummary(id)])
      .then(([equipmentData, summaryData]) => {
        setEquipment(equipmentData);
        setSummary(summaryData);
      })
      .catch(() => setError('Unable to load equipment dashboard.'))
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit = hasPermission(PERMISSIONS.EQUIPMENT_UPDATE);

  const fields = [
    { label: 'Equipment Code', value: equipment?.equipmentCode },
    { label: 'Equipment Name', value: equipment?.equipmentName },
    { label: 'Site', value: formatSite(equipment) },
    { label: 'Category', value: equipment?.category },
    { label: 'Location', value: equipment?.location },
    { label: 'Manufacturer', value: equipment?.manufacturer },
    { label: 'Model Number', value: equipment?.modelNumber },
    { label: 'Serial Number', value: equipment?.serialNumber },
    { label: 'Status', value: equipment?.status, variant: 'chip' },
    { label: 'Lifecycle Status', value: equipment?.lifecycleStatus, variant: 'chip' },
    { label: 'Operating Status', value: equipment?.operatingStatus, variant: 'chip' },
    { label: 'Asset Condition', value: equipment?.assetCondition, variant: 'chip' },
    { label: 'Ownership Type', value: equipment?.ownershipType },
    { label: 'Installation Date', value: formatDate(equipment?.installationDate) },
    { label: 'Commissioning Date', value: formatDate(equipment?.commissioningDate) },
    { label: 'Warranty Expiry', value: formatDate(equipment?.warrantyExpiryDate) },
    { label: 'Decommission Date', value: formatDate(equipment?.decommissionDate) },
    { label: 'Criticality', value: equipment?.criticality, variant: 'chip' },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>View Equipment</Typography>
          <Typography variant="body2" color="text.secondary">{equipment?.equipmentName || 'Equipment details'}</Typography>
        </Box>
        {canEdit && (
          <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/equipment/${id}/edit`)}>
            Edit
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <CommonFormCard>
        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 18 }).map((_, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            <Tabs
              value={activeTab}
              onChange={(event, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab value="overview" label="Overview" />
              <Tab value="requests" label="Open Requests" />
              <Tab value="pm" label="PM Schedule" />
              <Tab value="downtime" label="Downtime History" />
              <Tab value="spares" label="Spare BOM" />
              <Tab value="documents" label="Documents" />
              <Tab value="meters" label="Meter Readings" />
              <Tab value="cost" label="Cost Summary" />
            </Tabs>

            {activeTab === 'overview' && (
              <Stack spacing={3}>
                <SummaryGrid summary={summary} />
                <Grid container spacing={2.5}>
                  {fields.map((field) => (
                    <Grid item xs={12} sm={6} md={4} key={field.label}>
                      <DetailItem label={field.label} value={field.value} variant={field.variant} />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}

            {activeTab === 'requests' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}><Metric label="Open Requests" value={summary?.openRequestCount} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Health Impact" value={summary?.openRequestCount > 0 ? 'Attention' : 'Clear'} variant={summary?.openRequestCount > 0 ? 'warning-chip' : 'success-chip'} /></Grid>
              </Grid>
            )}

            {activeTab === 'pm' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}><Metric label="Active PM" value={summary?.activePmCount} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Next PM Date" value={formatDate(summary?.nextPmDate)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Last Maintenance" value={formatDate(summary?.lastMaintenanceDate)} /></Grid>
              </Grid>
            )}

            {activeTab === 'downtime' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}><Metric label="This Month" value={formatMinutes(summary?.totalDowntimeMinutesThisMonth)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Last Downtime" value={formatDateTime(summary?.lastDowntimeAt)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Last Duration" value={formatMinutes(summary?.lastDowntimeMinutes)} /></Grid>
                <Grid item xs={12} md={3}><Metric label="Last Reason" value={summary?.lastDowntimeReason} /></Grid>
              </Grid>
            )}

            {activeTab === 'spares' && <EmptyPanel title="Spare BOM" value="No spare BOM records available." />}
            {activeTab === 'documents' && <EmptyPanel title="Documents" value="No equipment documents recorded." />}
            {activeTab === 'meters' && <EmptyPanel title="Meter Readings" value="No meter readings recorded." />}

            {activeTab === 'cost' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}><Metric label="Health Score" value={summary?.healthScore == null ? '' : `${summary.healthScore}%`} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Health Status" value={summary?.healthStatus} variant={healthVariant(summary?.healthStatus)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Downtime This Month" value={formatMinutes(summary?.totalDowntimeMinutesThisMonth)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Metric label="Open Requests" value={summary?.openRequestCount} /></Grid>
              </Grid>
            )}
          </>
        )}

        <CommonFormActions
          showSave={false}
          onCancel={() => navigate('/equipment')}
          cancelLabel="Back"
        />
      </CommonFormCard>
    </Box>
  );
}

function SummaryGrid({ summary }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}><Metric label="Health Score" value={summary?.healthScore == null ? '' : `${summary.healthScore}%`} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Health Status" value={summary?.healthStatus} variant={healthVariant(summary?.healthStatus)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Open Requests" value={summary?.openRequestCount} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Active PM" value={summary?.activePmCount} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Downtime This Month" value={formatMinutes(summary?.totalDowntimeMinutesThisMonth)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Last Maintenance" value={formatDate(summary?.lastMaintenanceDate)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Next PM Date" value={formatDate(summary?.nextPmDate)} /></Grid>
      <Grid item xs={12} sm={6} md={3}><Metric label="Last Downtime" value={formatDateTime(summary?.lastDowntimeAt)} /></Grid>
    </Grid>
  );
}

function Metric({ label, value, variant }) {
  const display = displayValue(value);
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, minHeight: 82 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 700 }}>
        {label}
      </Typography>
      {variant && display !== '-' ? (
        <Chip size="small" label={display} color={chipColor(variant)} variant={variant === 'chip' ? 'outlined' : 'filled'} />
      ) : (
        <Typography variant="h6" fontWeight={800} sx={{ wordBreak: 'break-word' }}>
          {display}
        </Typography>
      )}
    </Box>
  );
}

function EmptyPanel({ title, value }) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
      <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{value}</Typography>
    </Box>
  );
}

function DetailItem({ label, value, variant }) {
  const display = displayValue(value);
  return (
    <Box sx={{ minHeight: 54 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>
        {label}
      </Typography>
      {variant === 'chip' && display !== '-' ? (
        <Chip size="small" label={display} variant="outlined" />
      ) : (
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
          {display}
        </Typography>
      )}
    </Box>
  );
}

function chipColor(variant) {
  if (variant === 'success-chip') return 'success';
  if (variant === 'warning-chip') return 'warning';
  if (variant === 'error-chip') return 'error';
  return 'default';
}

function healthVariant(status) {
  if (status === 'GOOD') return 'success-chip';
  if (status === 'WARNING') return 'warning-chip';
  if (status === 'CRITICAL') return 'error-chip';
  return 'chip';
}

function displayValue(value) {
  return value === null || value === undefined || value === '' ? '-' : String(value);
}

function formatSite(equipment) {
  if (!equipment?.siteName && !equipment?.siteCode) return '';
  if (!equipment.siteCode) return equipment.siteName;
  if (!equipment.siteName) return equipment.siteCode;
  return `${equipment.siteName} (${equipment.siteCode})`;
}

function formatDate(value) {
  return value || '';
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : '';
}

function formatMinutes(value) {
  if (value === null || value === undefined || value === '') return '';
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) return '';
  if (minutes < 60) return `${minutes} min`;
  return `${(minutes / 60).toFixed(1)} hr`;
}

export default EquipmentViewPage;

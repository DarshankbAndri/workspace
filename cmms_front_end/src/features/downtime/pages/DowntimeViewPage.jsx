import React from 'react';
import { Alert, Box, Button, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getDowntimeEntryById } from '../../maintenance/services/maintenanceService';
import { useAuth } from '../../../shared/context/AuthContext';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

function DowntimeViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [downtime, setDowntime] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    setError('');
    getDowntimeEntryById(id)
      .then((data) => setDowntime(data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load downtime entry.'))
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit = hasPermission('DOWNTIME_UPDATE');
  const fields = [
    { label: 'Site', value: formatSite(downtime) },
    { label: 'Equipment', value: formatEquipment(downtime) },
    { label: 'Maintenance Request', value: formatRequest(downtime) },
    { label: 'Reason', value: downtime?.reason },
    { label: 'Start Time', value: formatDateTime(downtime?.downtimeStart) },
    { label: 'End Time', value: formatDateTime(downtime?.downtimeEnd) },
    { label: 'Minutes', value: downtime?.downtimeMinutes },
    { label: 'Hours', value: downtime?.downtimeHours },
    { label: 'Days', value: downtime?.downtimeDays },
    { label: 'Remarks', value: downtime?.remarks, size: 12 },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>View Downtime</Typography>
          <Typography variant="body2" color="text.secondary">{downtime?.equipmentName || 'Downtime details'}</Typography>
        </Box>
        {canEdit && (
          <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/maintenance/downtime/${id}/edit`)}>
            Edit
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <CommonFormCard>
        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 10 }).map((_, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2.5}>
            {fields.map((field) => (
              <Grid item xs={12} sm={field.size || 6} md={field.size || 4} key={field.label}>
                <DetailItem label={field.label} value={field.value} />
              </Grid>
            ))}
          </Grid>
        )}

        <CommonFormActions
          showSave={false}
          onCancel={() => navigate('/maintenance/downtime')}
          cancelLabel="Back"
        />
      </CommonFormCard>
    </Box>
  );
}

function DetailItem({ label, value }) {
  return (
    <Box sx={{ minHeight: 54 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {displayValue(value)}
      </Typography>
    </Box>
  );
}

function displayValue(value) {
  return value === null || value === undefined || value === '' ? '-' : String(value);
}

function formatSite(downtime) {
  if (!downtime?.siteName && !downtime?.siteCode) return '';
  if (!downtime.siteCode) return downtime.siteName;
  if (!downtime.siteName) return downtime.siteCode;
  return `${downtime.siteName} (${downtime.siteCode})`;
}

function formatEquipment(downtime) {
  if (!downtime?.equipmentName && !downtime?.equipmentCode) return '';
  if (!downtime.equipmentCode) return downtime.equipmentName;
  if (!downtime.equipmentName) return downtime.equipmentCode;
  return `${downtime.equipmentCode} - ${downtime.equipmentName}`;
}

function formatRequest(downtime) {
  if (!downtime?.requestNumber && !downtime?.requestTitle) return 'No request';
  if (!downtime.requestTitle) return downtime.requestNumber;
  if (!downtime.requestNumber) return downtime.requestTitle;
  return `${downtime.requestNumber} - ${downtime.requestTitle}`;
}

function formatDateTime(value) {
  return value ? String(value).replace('T', ' ') : '';
}

export default DowntimeViewPage;

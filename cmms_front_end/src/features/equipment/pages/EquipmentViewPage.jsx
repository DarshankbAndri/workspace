import React from 'react';
import { Alert, Box, Button, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getEquipmentById } from '../services/equipmentService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

function EquipmentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [equipment, setEquipment] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    setError('');
    getEquipmentById(id)
      .then((data) => setEquipment(data))
      .catch(() => setError('Unable to load equipment.'))
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
    { label: 'Installation Date', value: formatDate(equipment?.installationDate) },
    { label: 'Warranty Expiry', value: formatDate(equipment?.warrantyExpiryDate) },
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
            {Array.from({ length: 12 }).map((_, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2.5}>
            {fields.map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field.label}>
                <DetailItem label={field.label} value={field.value} variant={field.variant} />
              </Grid>
            ))}
          </Grid>
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

export default EquipmentViewPage;

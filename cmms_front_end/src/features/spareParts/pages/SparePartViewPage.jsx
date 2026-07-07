import React from 'react';
import { Alert, Box, Button, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getSparePartById } from '../services/sparePartService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

function SparePartViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [sparePart, setSparePart] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    setError('');
    getSparePartById(id)
      .then((data) => setSparePart(data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load spare part.'))
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit = hasPermission(PERMISSIONS.SPARE_PART_UPDATE);

  const fields = [
    { label: 'Part Code', value: sparePart?.partCode },
    { label: 'Part Name', value: sparePart?.partName },
    { label: 'Site', value: formatSite(sparePart) },
    { label: 'Category', value: sparePart?.category },
    { label: 'Unit', value: sparePart?.unit },
    { label: 'Status', value: sparePart?.status, variant: 'chip' },
    { label: 'Current Stock', value: formatQuantity(sparePart?.currentStock, sparePart?.unit) },
    { label: 'Reserved Stock', value: formatQuantity(sparePart?.reservedStock, sparePart?.unit) },
    { label: 'Available Stock', value: formatQuantity(sparePart?.availableStock, sparePart?.unit) },
    { label: 'Minimum Stock', value: formatQuantity(sparePart?.minimumStock, sparePart?.unit) },
    { label: 'Stock Status', value: sparePart?.lowStock ? 'Low Stock' : 'OK', variant: sparePart?.lowStock ? 'warning-chip' : 'success-chip' },
    { label: 'Unit Cost', value: formatMoney(sparePart?.unitCost) },
    { label: 'Storage Location', value: sparePart?.storageLocation },
    { label: 'Preferred Vendor', value: sparePart?.preferredVendorName },
    { label: 'Created At', value: formatDateTime(sparePart?.createdAt) },
    { label: 'Updated At', value: formatDateTime(sparePart?.updatedAt) },
    { label: 'Description', value: sparePart?.description },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>View Spare Part</Typography>
          <Typography variant="body2" color="text.secondary">{sparePart?.partName || 'Spare part details'}</Typography>
        </Box>
        {canEdit && (
          <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/inventory/spare-parts/${id}/edit`)}>
            Edit
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <CommonFormCard>
        {loading ? (
          <Grid container spacing={2}>
            {Array.from({ length: 15 }).map((_, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2.5}>
            {fields.map((field) => (
              <Grid item xs={12} sm={field.label === 'Description' ? 12 : 6} md={field.label === 'Description' ? 12 : 4} key={field.label}>
                <DetailItem label={field.label} value={field.value} variant={field.variant} />
              </Grid>
            ))}
          </Grid>
        )}

        <CommonFormActions
          showSave={false}
          onCancel={() => navigate('/inventory/spare-parts')}
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
      {variant && display !== '-' ? (
        <Chip size="small" label={display} color={chipColor(variant)} variant={variant === 'chip' ? 'outlined' : 'filled'} />
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

function chipColor(variant) {
  if (variant === 'warning-chip') return 'warning';
  if (variant === 'success-chip') return 'success';
  return 'default';
}

function formatSite(sparePart) {
  if (!sparePart?.siteName && !sparePart?.siteCode) return '';
  if (!sparePart.siteCode) return sparePart.siteName;
  if (!sparePart.siteName) return sparePart.siteCode;
  return `${sparePart.siteName} (${sparePart.siteCode})`;
}

function formatQuantity(value, unit) {
  if (value === null || value === undefined || value === '') return '';
  const formatted = Number(value).toLocaleString(undefined, { maximumFractionDigits: 3 });
  return unit ? `${formatted} ${unit}` : formatted;
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '';
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : '';
}

export default SparePartViewPage;

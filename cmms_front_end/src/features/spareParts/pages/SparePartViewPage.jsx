import React from 'react';
import { Alert, Box, Button, Chip, Grid, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Edit, Visibility } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getSparePartById, getSparePartEquipmentBom } from '../services/sparePartService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

function SparePartViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [sparePart, setSparePart] = React.useState(null);
  const [equipmentBom, setEquipmentBom] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([getSparePartById(id), getSparePartEquipmentBom(id)])
      .then(([data, bomRows]) => {
        setSparePart(data);
        setEquipmentBom(bomRows || []);
      })
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
          <Stack spacing={3}>
            <Grid container spacing={2.5}>
              {fields.map((field) => (
                <Grid item xs={12} sm={field.label === 'Description' ? 12 : 6} md={field.label === 'Description' ? 12 : 4} key={field.label}>
                  <DetailItem label={field.label} value={field.value} variant={field.variant} />
                </Grid>
              ))}
            </Grid>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Linked Equipment BOM</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Equipment</TableCell>
                      <TableCell>Recommended</TableCell>
                      <TableCell>Criticality</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Remarks</TableCell>
                      <TableCell align="right">View</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {equipmentBom.length === 0 ? (
                      <TableRow><TableCell colSpan={7}>No linked equipment BOM rows.</TableCell></TableRow>
                    ) : equipmentBom.map((row) => (
                      <TableRow key={row.bomId} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/equipment/${row.equipmentId}/view`)}>
                        <TableCell>{formatEquipment(row)}</TableCell>
                        <TableCell>{formatQuantity(row.recommendedQty, sparePart?.unit)}</TableCell>
                        <TableCell><Chip size="small" label={row.criticality || 'MEDIUM'} variant="outlined" /></TableCell>
                        <TableCell>{row.replacementFrequency || '-'}</TableCell>
                        <TableCell>{row.status || 'ACTIVE'}</TableCell>
                        <TableCell>{row.remarks || '-'}</TableCell>
                        <TableCell align="right"><Visibility fontSize="small" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Stack>
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

function formatEquipment(row) {
  if (!row?.equipmentName && !row?.equipmentCode) return '-';
  if (!row.equipmentCode) return row.equipmentName;
  if (!row.equipmentName) return row.equipmentCode;
  return `${row.equipmentCode} - ${row.equipmentName}`;
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '';
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : '';
}

export default SparePartViewPage;

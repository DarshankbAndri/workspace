import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getVendorById } from '../services/vendorService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

function VendorViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [vendor, setVendor] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    setError('');
    getVendorById(id)
      .then((data) => setVendor(data))
      .catch(() => setError('Unable to load vendor.'))
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit = hasPermission(PERMISSIONS.VENDOR_UPDATE);
  const fields = [
    { label: 'Vendor Code', value: vendor?.vendorCode },
    { label: 'Vendor Name', value: vendor?.vendorName },
    { label: 'Contact Person', value: vendor?.contactPerson },
    { label: 'Email', value: vendor?.email },
    { label: 'Phone', value: vendor?.phone },
    { label: 'Service Category', value: vendor?.serviceCategory },
    { label: 'Active vendor', value: vendor?.active ? 'Yes' : 'No', variant: 'chip' },
    { label: 'Address', value: vendor?.address, size: 12 },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>View Vendor</Typography>
          <Typography variant="body2" color="text.secondary">{vendor?.vendorName || 'Vendor details'}</Typography>
        </Box>
        {canEdit && (
          <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/vendors/${id}/edit`)}>
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
          <>
            <Grid container spacing={2.5}>
              {fields.map((field) => (
                <Grid item xs={12} sm={field.size || 6} md={field.size || 4} key={field.label}>
                  <DetailItem label={field.label} value={field.value} variant={field.variant} />
                </Grid>
              ))}
            </Grid>

            <TableContainer sx={{ mt: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 240 }}>Site</TableCell>
                    <TableCell align="center">Primary</TableCell>
                    <TableCell sx={{ minWidth: 150 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(vendor?.siteAssignments || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" color="text.secondary">No site assignments.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {(vendor?.siteAssignments || []).map((assignment, index) => (
                    <TableRow key={`${assignment.assignmentId || 'site'}-${index}`}>
                      <TableCell>{formatSite(assignment)}</TableCell>
                      <TableCell align="center">{assignment.primarySite ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{displayValue(assignment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        <CommonFormActions
          showSave={false}
          onCancel={() => navigate('/vendors')}
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
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {display}
        </Typography>
      )}
    </Box>
  );
}

function displayValue(value) {
  return value === null || value === undefined || value === '' ? '-' : String(value);
}

function formatSite(assignment) {
  if (!assignment?.siteName && !assignment?.siteCode) return '-';
  if (!assignment.siteCode) return assignment.siteName;
  if (!assignment.siteName) return assignment.siteCode;
  return `${assignment.siteName} (${assignment.siteCode})`;
}

export default VendorViewPage;

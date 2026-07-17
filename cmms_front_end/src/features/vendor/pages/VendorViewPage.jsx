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
import { Add, Edit } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getVendorById } from '../services/vendorService';
import { getVendorAmcContracts } from '../../vendorAmc/services/vendorAmcService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

function VendorViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [vendor, setVendor] = React.useState(null);
  const [amcContracts, setAmcContracts] = React.useState([]);
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

  React.useEffect(() => {
    if (!hasPermission(PERMISSIONS.VENDOR_AMC_VIEW)) return;
    getVendorAmcContracts(id)
      .then((data) => setAmcContracts(data || []))
      .catch(() => setAmcContracts([]));
  }, [hasPermission, id]);

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

            {hasPermission(PERMISSIONS.VENDOR_AMC_VIEW) && (
              <Box sx={{ mt: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1 }}>
                  <Typography variant="h6">AMC Contracts</Typography>
                  {hasPermission(PERMISSIONS.VENDOR_AMC_CREATE) && (
                    <Button variant="outlined" startIcon={<Add />} onClick={() => navigate('/vendor-amc/create')}>
                      Create AMC
                    </Button>
                  )}
                </Stack>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Contract Number</TableCell>
                        <TableCell>Contract Name</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Equipment</TableCell>
                        <TableCell>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {amcContracts.length === 0 ? (
                        <TableRow><TableCell colSpan={7}>No AMC contracts.</TableCell></TableRow>
                      ) : amcContracts.map((contract) => (
                        <TableRow key={contract.id} hover onClick={() => navigate(`/vendor-amc/view/${contract.id}`)} sx={{ cursor: 'pointer' }}>
                          <TableCell>{contract.contractNumber}</TableCell>
                          <TableCell>{contract.contractName}</TableCell>
                          <TableCell>{contract.startDate}</TableCell>
                          <TableCell>{contract.endDate}</TableCell>
                          <TableCell><Chip size="small" label={displayValue(contract.status).replaceAll('_', ' ')} variant="outlined" /></TableCell>
                          <TableCell>{contract.coveredEquipmentCount || 0}</TableCell>
                          <TableCell>{formatMoney(contract.contractValue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
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

function formatMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '-';
  return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default VendorViewPage;

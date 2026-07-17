import React from 'react';
import { Alert, Box, Button, Chip, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';
import { getVendorAmcContract } from '../services/vendorAmcService';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';

function VendorAmcViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [contract, setContract] = React.useState(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    getVendorAmcContract(id)
      .then(setContract)
      .catch((err) => setError(err.response?.data?.message || 'Unable to load AMC contract.'));
  }, [id]);

  const fields = [
    ['Vendor', contract?.vendorName],
    ['Contract Number', contract?.contractNumber],
    ['Contract Name', contract?.contractName],
    ['Contract Type', formatLabel(contract?.contractType)],
    ['Start Date', contract?.startDate],
    ['End Date', contract?.endDate],
    ['Contract Value', formatMoney(contract?.contractValue)],
    ['Response SLA', contract?.responseTimeHours ? `${contract.responseTimeHours} hrs` : '-'],
    ['Resolution SLA', contract?.resolutionTimeHours ? `${contract.resolutionTimeHours} hrs` : '-'],
    ['Labor Included', contract?.includesLabor ? 'Yes' : 'No'],
    ['Spares Included', contract?.includesSpares ? 'Yes' : 'No'],
    ['Contact Person', contract?.contactPerson],
    ['Contact Phone', contract?.contactPhone],
    ['Contact Email', contract?.contactEmail],
    ['Days Remaining', contract?.daysRemaining],
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>AMC Contract</Typography>
          <Typography variant="body2" color="text.secondary">{contract?.contractNumber || 'Vendor AMC details'}</Typography>
        </Box>
        {hasPermission(PERMISSIONS.VENDOR_AMC_UPDATE) && (
          <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/vendor-amc/edit/${id}`)}>Edit</Button>
        )}
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <CommonFormCard>
        <Stack spacing={3}>
          {contract?.status && <Chip label={formatLabel(contract.status)} color={statusColor(contract.status)} sx={{ alignSelf: 'flex-start' }} />}
          <Grid container spacing={2.5}>
            {fields.map(([label, value]) => (
              <Grid item xs={12} sm={6} md={4} key={label}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>{label}</Typography>
                <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{display(value)}</Typography>
              </Grid>
            ))}
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>Coverage Description</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{display(contract?.coverageDescription)}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>Remarks</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{display(contract?.remarks)}</Typography>
            </Grid>
          </Grid>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>Covered Equipment</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Equipment</TableCell>
                    <TableCell>Site</TableCell>
                    <TableCell>Coverage Type</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(contract?.equipmentMappings || []).length === 0 ? (
                    <TableRow><TableCell colSpan={6}>No equipment mapped.</TableCell></TableRow>
                  ) : contract.equipmentMappings.map((mapping) => (
                    <TableRow key={mapping.id || mapping.equipmentId}>
                      <TableCell>{mapping.equipmentCode} - {mapping.equipmentName}</TableCell>
                      <TableCell>{display(mapping.siteName)}</TableCell>
                      <TableCell>{formatLabel(mapping.coverageType)}</TableCell>
                      <TableCell>{mapping.coverageStartDate}</TableCell>
                      <TableCell>{mapping.coverageEndDate}</TableCell>
                      <TableCell>{mapping.active ? 'Active' : 'Inactive'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>
        <CommonFormActions showSave={false} onCancel={() => navigate('/vendor-amc')} cancelLabel="Back" />
      </CommonFormCard>
    </Box>
  );
}

function display(value) {
  return value === null || value === undefined || value === '' ? '-' : String(value);
}

function formatLabel(value) {
  return value ? String(value).replaceAll('_', ' ') : '-';
}

function formatMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '-';
  return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusColor(value) {
  if (value === 'ACTIVE') return 'success';
  if (value === 'EXPIRING_SOON') return 'warning';
  if (value === 'EXPIRED' || value === 'TERMINATED') return 'error';
  return 'default';
}

export default VendorAmcViewPage;

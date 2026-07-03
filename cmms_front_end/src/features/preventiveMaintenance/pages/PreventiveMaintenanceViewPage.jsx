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
import { getPMScheduleById } from '../services/preventiveMaintenanceService';
import { useAuth } from '../../../shared/context/AuthContext';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

function PreventiveMaintenanceViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [schedule, setSchedule] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    setError('');
    getPMScheduleById(id)
      .then((data) => setSchedule(data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load PM schedule.'))
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit = hasPermission('REQUEST_UPDATE');
  const fields = [
    { label: 'Site', value: formatSite(schedule) },
    { label: 'Equipment', value: formatEquipment(schedule) },
    { label: 'Assigned Vendor', value: schedule?.vendorName || 'Internal team' },
    { label: 'Assigned To', value: schedule?.assignedTo },
    { label: 'PM Task', value: schedule?.title },
    { label: 'Frequency', value: schedule?.frequency, variant: 'chip' },
    { label: 'Priority', value: schedule?.priority, variant: 'chip' },
    { label: 'Status', value: schedule?.active === false ? 'Inactive' : 'Active', variant: 'chip' },
    { label: 'Approval Status', value: schedule?.status || 'ACTIVE', variant: 'chip' },
    { label: 'Start Date', value: formatDate(schedule?.startDate) },
    { label: 'Next Due Date', value: formatDate(schedule?.nextDueDate) },
    { label: 'Description', value: schedule?.description, size: 12 },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>View PM Schedule</Typography>
          <Typography variant="body2" color="text.secondary">{schedule?.title || 'Preventive maintenance schedule details'}</Typography>
        </Box>
        {canEdit && (
          <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/maintenance/preventive/${id}/edit`)}>
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
          <>
            <Grid container spacing={2.5}>
              {fields.map((field) => (
                <Grid item xs={12} sm={field.size || 6} md={field.size || 4} key={field.label}>
                  <DetailItem label={field.label} value={field.value} variant={field.variant} />
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" fontWeight={800} sx={{ mt: 3, mb: 1 }}>
              Checklist
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 220 }}>Step</TableCell>
                    <TableCell sx={{ minWidth: 220 }}>Instructions</TableCell>
                    <TableCell sx={{ minWidth: 130 }}>Response</TableCell>
                    <TableCell align="center">Required</TableCell>
                    <TableCell align="center">Proof</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(schedule?.checklistItems || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">No checklist steps.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {(schedule?.checklistItems || []).map((item, index) => (
                    <TableRow key={`${item.id || 'step'}-${index}`}>
                      <TableCell>{displayValue(item.taskTitle)}</TableCell>
                      <TableCell>{displayValue(item.instructions)}</TableCell>
                      <TableCell>{displayValue(item.responseType || 'CHECKBOX')}</TableCell>
                      <TableCell align="center">{item.required === false ? 'No' : 'Yes'}</TableCell>
                      <TableCell align="center">{item.proofRequired ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        <CommonFormActions
          showSave={false}
          onCancel={() => navigate('/maintenance/preventive')}
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

function formatSite(schedule) {
  if (!schedule?.siteName && !schedule?.siteCode) return '';
  if (!schedule.siteCode) return schedule.siteName;
  if (!schedule.siteName) return schedule.siteCode;
  return `${schedule.siteName} (${schedule.siteCode})`;
}

function formatEquipment(schedule) {
  if (!schedule?.equipmentName && !schedule?.equipmentCode) return '';
  if (!schedule.equipmentCode) return schedule.equipmentName;
  if (!schedule.equipmentName) return schedule.equipmentCode;
  return `${schedule.equipmentCode} - ${schedule.equipmentName}`;
}

function formatDate(value) {
  return value || '';
}

export default PreventiveMaintenanceViewPage;

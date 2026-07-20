import React from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, LinearProgress, Skeleton, Snackbar, Stack, Typography } from '@mui/material';
import { Assignment, Build, Cancel, CheckCircle, Edit, Inventory, Lock, Pause, PlayArrow, Replay, Timeline } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getMaintenanceRequestById, getRequestRelatedRecords, transitionMaintenanceRequest } from '../services/maintenanceRequestService';
import { useAuth } from '../../../shared/context/AuthContext';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';

function MaintenanceRequestViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [request, setRequest] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [transitioning, setTransitioning] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState(null);
  const [reason, setReason] = React.useState('');
  const [relatedRecords, setRelatedRecords] = React.useState(null);

  React.useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([getMaintenanceRequestById(id), getRequestRelatedRecords(id).catch(() => null)])
      .then(([data, related]) => {
        setRequest(data);
        setRelatedRecords(related);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load maintenance request.'))
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit = hasPermission('REQUEST_UPDATE');
  const actions = canEdit && request ? getAvailableActions(request.status) : [];
  const latestAssignment = relatedRecords?.assignment;
  const latestDowntime = relatedRecords?.downtime;

  const submitTransition = async (action, actionReason = '') => {
    setTransitioning(true);
    setError('');
    try {
      const data = await transitionMaintenanceRequest(id, { action, reason: actionReason });
      setRequest(data);
      setSuccess('Request status updated.');
      setPendingAction(null);
      setReason('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update request status.');
    } finally {
      setTransitioning(false);
    }
  };

  const handleAction = (action) => {
    if (action.requiresReason) {
      setPendingAction(action);
      setReason('');
      return;
    }
    submitTransition(action.value);
  };

  const confirmReasonAction = () => {
    if (!pendingAction) return;
    submitTransition(pendingAction.value, reason);
  };

  const fields = [
    { label: 'Site', value: formatSite(request) },
    { label: 'Equipment', value: formatEquipment(request) },
    { label: 'Title', value: request?.title },
    { label: 'Reported By', value: request?.reportedBy },
    { label: 'Type', value: request?.requestType, variant: 'chip' },
    { label: 'Priority', value: request?.priority, variant: 'chip' },
    { label: 'Status', value: request?.status, variant: 'chip' },
    { label: 'Requested Date', value: formatDate(request?.requestedDate) },
    { label: 'Target Completion', value: formatDate(request?.targetCompletionDate) },
    { label: 'Description', value: request?.description, size: 12 },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>View Request</Typography>
          <Typography variant="body2" color="text.secondary">{request?.title || 'Maintenance request details'}</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {actions.map((action) => (
            <Button
              key={action.value}
              variant={action.variant || 'outlined'}
              color={action.color || 'primary'}
              startIcon={action.icon}
              disabled={transitioning}
              onClick={() => handleAction(action)}
            >
              {action.label}
            </Button>
          ))}
          {canEdit && (
            <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/maintenance/requests/${id}/edit`)}>
              Edit
            </Button>
          )}
        </Stack>
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
          <Stack spacing={3}>
            <RequestSummary request={request} />
            <RequestLifecycle status={request?.status} />
            <Grid container spacing={2.5}>
              {fields.map((field) => (
                <Grid item xs={12} sm={field.size || 6} md={field.size || 4} key={field.label}>
                  <DetailItem label={field.label} value={field.value} variant={field.variant} />
                </Grid>
              ))}
            </Grid>
            <Divider />
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={800}>Linked Records</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {request?.equipmentId && hasPermission('EQUIPMENT_VIEW') && (
                  <Button variant="outlined" startIcon={<Build />} onClick={() => navigate(`/equipment/${request.equipmentId}/view`)}>
                    View Equipment
                  </Button>
                )}
                {request?.amcContractId && hasPermission('VENDOR_AMC_VIEW') && (
                  <Button variant="outlined" onClick={() => navigate(`/vendor-amc/view/${request.amcContractId}`)}>
                    View AMC
                  </Button>
                )}
                {latestAssignment && hasPermission('ASSIGNMENT_VIEW') && (
                  <Button variant="outlined" startIcon={<Assignment />} onClick={() => navigate(`/maintenance/assignments/${latestAssignment.id}/view`)}>
                    View Assignment
                  </Button>
                )}
                {!latestAssignment && request?.status === 'OPEN' && hasPermission('ASSIGNMENT_CREATE') && (
                  <Button variant="contained" startIcon={<Assignment />} onClick={() => navigate(`/maintenance/assignments/new?requestId=${request.id}`)}>
                    Create Assignment
                  </Button>
                )}
                {latestDowntime && hasPermission('DOWNTIME_VIEW') && (
                  <Button variant="outlined" startIcon={<Timeline />} onClick={() => navigate(`/maintenance/downtime/${latestDowntime.id}/view`)}>
                    View Downtime
                  </Button>
                )}
                {request?.requestType === 'BREAKDOWN' && !latestDowntime && hasPermission('DOWNTIME_CREATE') && (
                  <Button variant="outlined" startIcon={<Timeline />} onClick={() => navigate(`/maintenance/downtime/new?requestId=${request.id}`)}>
                    Create Downtime
                  </Button>
                )}
                {latestAssignment && hasPermission('SPARE_USAGE_CREATE') && (
                  <Button variant="outlined" startIcon={<Inventory />} onClick={() => navigate(`/maintenance/assignments/${latestAssignment.id}/view?tab=spares`)}>
                    Request Spare
                  </Button>
                )}
              </Stack>
              <RelatedRecordGrid relatedRecords={relatedRecords} />
            </Stack>
          </Stack>
        )}

        <CommonFormActions
          showSave={false}
          onCancel={() => navigate('/maintenance/requests')}
          cancelLabel="Back"
        />
      </CommonFormCard>
      <Dialog open={Boolean(pendingAction)} onClose={() => setPendingAction(null)} fullWidth maxWidth="sm">
        <DialogTitle>{pendingAction?.label}</DialogTitle>
        <DialogContent>
          <CommonTextArea
            autoFocus
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            minRows={3}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingAction(null)}>Cancel</Button>
          <Button variant="contained" disabled={transitioning || !reason.trim()} onClick={confirmReasonAction}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess('')} message={success} />
    </Box>
  );
}

function RequestSummary({ request }) {
  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="overline" color="text.secondary" fontWeight={800}>Request</Typography>
          <Typography variant="h5" fontWeight={900}>{request?.requestNumber || '-'}</Typography>
          <Typography variant="body2" color="text.secondary">{request?.title || '-'}</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <Chip label={formatLabel(request?.status)} color={statusColor(request?.status)} variant="outlined" />
          <Chip label={formatLabel(request?.priority)} color={priorityColor(request?.priority)} />
          <Chip label={`Age ${ageingLabel(request?.requestedDate)}`} variant="outlined" />
          {isOverdue(request) && <Chip label="Overdue" color="error" />}
        </Stack>
      </Stack>
    </Box>
  );
}

function RequestLifecycle({ status }) {
  const currentIndex = lifecycleSteps.findIndex((step) => step.statuses.includes(status));
  const progress = currentIndex < 0 ? 0 : (currentIndex / (lifecycleSteps.length - 1)) * 100;
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
        {lifecycleSteps.map((step, index) => (
          <Box key={step.label} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color={index <= currentIndex ? 'primary.main' : 'text.secondary'} fontWeight={index <= currentIndex ? 800 : 500}>
              {step.label}
            </Typography>
          </Box>
        ))}
      </Stack>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
    </Box>
  );
}

function RelatedRecordGrid({ relatedRecords }) {
  const spareCount = relatedRecords?.spareUsages?.length || 0;
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}><DetailItem label="Assignment" value={relatedRecords?.assignment ? `${relatedRecords.assignment.status} - ${relatedRecords.assignment.assignedEmployeeName || relatedRecords.assignment.assignedTo || '-'}` : 'Not assigned'} variant={relatedRecords?.assignment ? 'chip' : undefined} /></Grid>
      <Grid item xs={12} md={3}><DetailItem label="Approval" value={relatedRecords?.approval ? `${relatedRecords.approval.status} (${relatedRecords.approval.actionCode})` : 'No approval record'} /></Grid>
      <Grid item xs={12} md={3}><DetailItem label="Downtime" value={relatedRecords?.downtime ? `${formatMinutes(relatedRecords.downtime.durationMinutes)} - ${relatedRecords.downtime.status}` : 'No downtime linked'} /></Grid>
      <Grid item xs={12} md={3}><DetailItem label="Spare Usage" value={spareCount ? `${spareCount} linked spare request${spareCount === 1 ? '' : 's'}` : 'No spare usage linked'} /></Grid>
    </Grid>
  );
}

function getAvailableActions(status) {
  switch (status) {
    case 'ASSIGNED':
      return [
        { value: 'START', label: 'Start', icon: <PlayArrow fontSize="small" />, variant: 'contained' },
        { value: 'CANCEL', label: 'Cancel', icon: <Cancel fontSize="small" />, color: 'error', requiresReason: true },
      ];
    case 'IN_PROGRESS':
      return [
        { value: 'HOLD', label: 'Hold', icon: <Pause fontSize="small" />, color: 'warning', requiresReason: true },
        { value: 'COMPLETE', label: 'Complete', icon: <CheckCircle fontSize="small" />, variant: 'contained', color: 'success' },
        { value: 'CANCEL', label: 'Cancel', icon: <Cancel fontSize="small" />, color: 'error', requiresReason: true },
      ];
    case 'ON_HOLD':
      return [
        { value: 'RESUME', label: 'Resume', icon: <Replay fontSize="small" />, variant: 'contained' },
        { value: 'COMPLETE', label: 'Complete', icon: <CheckCircle fontSize="small" />, color: 'success' },
        { value: 'CANCEL', label: 'Cancel', icon: <Cancel fontSize="small" />, color: 'error', requiresReason: true },
      ];
    case 'COMPLETED':
      return [
        { value: 'REQUEST_CLOSE', label: 'Close', icon: <Lock fontSize="small" />, variant: 'contained' },
      ];
    case 'CANCELLED':
      return [
        { value: 'REOPEN', label: 'Reopen', icon: <Replay fontSize="small" />, requiresReason: true },
      ];
    case 'OPEN':
      return [
        { value: 'CANCEL', label: 'Cancel', icon: <Cancel fontSize="small" />, color: 'error', requiresReason: true },
      ];
    default:
      return [];
  }
}

function DetailItem({ label, value, variant }) {
  const display = displayValue(value);
  return (
    <Box sx={{ minHeight: 54 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>
        {label}
      </Typography>
      {variant === 'chip' && display !== '-' ? (
        <Chip size="small" label={formatLabel(display)} variant="outlined" />
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

function formatSite(request) {
  if (!request?.siteName && !request?.siteCode) return '';
  if (!request.siteCode) return request.siteName;
  if (!request.siteName) return request.siteCode;
  return `${request.siteName} (${request.siteCode})`;
}

function formatEquipment(request) {
  if (!request?.equipmentName && !request?.equipmentCode) return '';
  if (!request.equipmentCode) return request.equipmentName;
  if (!request.equipmentName) return request.equipmentCode;
  return `${request.equipmentCode} - ${request.equipmentName}`;
}

function formatDate(value) {
  return value || '';
}

function formatMinutes(value) {
  if (!value) return '-';
  if (value < 60) return `${value} min`;
  return `${Math.floor(value / 60)} hr ${value % 60} min`;
}

function ageingLabel(value) {
  if (!value) return '-';
  const requested = new Date(`${value}T00:00:00`);
  if (Number.isNaN(requested.getTime())) return '-';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.floor((today - requested) / 86400000));
  return days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'}`;
}

function isOverdue(request) {
  if (!request?.targetCompletionDate || ['COMPLETED', 'CLOSED', 'CANCELLED', 'REJECTED'].includes(String(request.status || '').toUpperCase())) {
    return false;
  }
  const target = new Date(`${request.targetCompletionDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return target < today;
}

function formatLabel(value) {
  if (!value) return '-';
  return String(value).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusColor(value) {
  const status = String(value || '').toUpperCase();
  if (status.includes('PENDING')) return 'warning';
  if (status === 'COMPLETED' || status === 'CLOSED') return 'success';
  if (status === 'CANCELLED' || status === 'REJECTED') return 'error';
  return 'info';
}

function priorityColor(value) {
  const priority = String(value || '').toUpperCase();
  if (priority === 'URGENT' || priority === 'CRITICAL') return 'error';
  if (priority === 'HIGH') return 'warning';
  if (priority === 'LOW') return 'default';
  return 'info';
}

const lifecycleSteps = [
  { label: 'Created', statuses: ['PENDING_APPROVAL', 'CANCELLED', 'REJECTED'] },
  { label: 'Approved / Open', statuses: ['OPEN'] },
  { label: 'Assigned', statuses: ['ASSIGNED'] },
  { label: 'In Progress', statuses: ['IN_PROGRESS', 'ON_HOLD'] },
  { label: 'Completed', statuses: ['COMPLETED', 'CLOSE_PENDING_APPROVAL'] },
  { label: 'Closed', statuses: ['CLOSED'] },
];

export default MaintenanceRequestViewPage;

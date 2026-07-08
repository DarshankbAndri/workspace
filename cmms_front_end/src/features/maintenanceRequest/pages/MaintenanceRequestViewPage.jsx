import React from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Skeleton, Snackbar, Stack, Typography } from '@mui/material';
import { Cancel, CheckCircle, Edit, Lock, Pause, PlayArrow, Replay } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getMaintenanceRequestById, transitionMaintenanceRequest } from '../services/maintenanceRequestService';
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

  React.useEffect(() => {
    setLoading(true);
    setError('');
    getMaintenanceRequestById(id)
      .then((data) => setRequest(data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load maintenance request.'))
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit = hasPermission('REQUEST_UPDATE');
  const actions = canEdit && request ? getAvailableActions(request.status) : [];

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
          <Grid container spacing={2.5}>
            {fields.map((field) => (
              <Grid item xs={12} sm={field.size || 6} md={field.size || 4} key={field.label}>
                <DetailItem label={field.label} value={field.value} variant={field.variant} />
              </Grid>
            ))}
          </Grid>
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

export default MaintenanceRequestViewPage;

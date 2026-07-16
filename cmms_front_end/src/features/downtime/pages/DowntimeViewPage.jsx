import React from 'react';
import { Alert, Box, Button, Chip, Divider, Grid, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Build, CheckCircle, Edit, PlayArrow, Replay, TaskAlt, Verified } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  addDowntimeRcaAction,
  closeDowntimeEntry,
  confirmDowntimeEntry,
  getDowntimeEntryById,
  getDowntimeRcaActions,
  getDowntimeTimeline,
  reopenDowntimeEntry,
  restoreDowntimeEntry,
  startDowntimeMaintenance,
  updateDowntimeRcaAction,
  verifyDowntimeEntry,
} from '../../maintenance/services/maintenanceService';
import { useAuth } from '../../../shared/context/AuthContext';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';

const statusColors = {
  OPEN: 'warning',
  CONFIRMED: 'info',
  UNDER_MAINTENANCE: 'primary',
  RESTORED: 'secondary',
  VERIFIED: 'success',
  CLOSED: 'default',
  REOPENED: 'warning',
  CANCELLED: 'default',
};

const actionTypeOptions = ['CORRECTIVE', 'PREVENTIVE'].map((value) => ({ value, label: formatLabel(value) }));
const rcaStatusOptions = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED'].map((value) => ({ value, label: formatLabel(value) }));

const initialRcaForm = {
  id: null,
  actionType: 'CORRECTIVE',
  description: '',
  targetDate: '',
  status: 'OPEN',
};

function DowntimeViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [tab, setTab] = React.useState(0);
  const [downtime, setDowntime] = React.useState(null);
  const [timeline, setTimeline] = React.useState([]);
  const [rcaActions, setRcaActions] = React.useState([]);
  const [rcaForm, setRcaForm] = React.useState(initialRcaForm);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const loadData = React.useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      getDowntimeEntryById(id),
      getDowntimeTimeline(id),
      getDowntimeRcaActions(id),
    ])
      .then(([detail, historyRows, rcaRows]) => {
        setDowntime(detail);
        setTimeline(historyRows || []);
        setRcaActions(rcaRows || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load downtime entry.'))
      .finally(() => setLoading(false));
  }, [id]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const runAction = async (label, action) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await action();
      setSuccess(label);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update downtime.');
    } finally {
      setActionLoading(false);
    }
  };

  const submitRca = async (event) => {
    event.preventDefault();
    if (!rcaForm.description.trim()) {
      setError('RCA action description is required.');
      return;
    }
    await runAction(rcaForm.id ? 'RCA action updated.' : 'RCA action added.', () => (
      rcaForm.id
        ? updateDowntimeRcaAction(id, rcaForm.id, rcaForm)
        : addDowntimeRcaAction(id, rcaForm)
    ));
    setRcaForm(initialRcaForm);
  };

  const canEdit = hasPermission('DOWNTIME_UPDATE') && !['CLOSED', 'CANCELLED'].includes(downtime?.status);
  const canConfirm = hasPermission('DOWNTIME_CONFIRM');
  const canVerify = hasPermission('DOWNTIME_VERIFY');
  const canClose = hasPermission('DOWNTIME_CLOSE');
  const canReopen = hasPermission('DOWNTIME_REOPEN');
  const canManageRca = hasPermission('DOWNTIME_RCA_MANAGE') && !['CLOSED', 'CANCELLED'].includes(downtime?.status);

  const summaryFields = [
    { label: 'Site', value: formatSite(downtime) },
    { label: 'Equipment', value: formatEquipment(downtime) },
    { label: 'Maintenance Request', value: formatRequest(downtime) },
    { label: 'Type', value: downtime?.planned ? 'Planned' : 'Unplanned' },
    { label: 'Reason Category', value: formatLabel(downtime?.reasonCategory) },
    { label: 'Reason Code', value: downtime?.reasonCode },
    { label: 'Reason', value: downtime?.reason },
    { label: 'Start Time', value: formatDateTime(downtime?.downtimeStart) },
    { label: 'End Time', value: formatDateTime(downtime?.downtimeEnd) },
    { label: 'Minutes', value: downtime?.downtimeMinutes },
    { label: 'Hours', value: downtime?.downtimeHours },
    { label: 'Verified By', value: downtime?.verifiedByName },
    { label: 'Verified At', value: formatDateTime(downtime?.verifiedAt) },
    { label: 'Closed At', value: formatDateTime(downtime?.closedAt) },
    { label: 'Root Cause', value: downtime?.rootCause, size: 12 },
    { label: 'Remarks', value: downtime?.remarks, size: 12 },
    { label: 'Closure Remarks', value: downtime?.closureRemarks, size: 12 },
  ];

  const lossFields = [
    { label: 'Production Line', value: downtime?.productionLine },
    { label: 'Shift', value: downtime?.shiftName },
    { label: 'Operator', value: downtime?.operatorName },
    { label: 'Expected Output / Hour', value: downtime?.expectedOutputPerHour },
    { label: 'Loss Rate / Unit', value: formatMoney(downtime?.lossRatePerUnit) },
    { label: 'Lost Quantity', value: downtime?.lostQuantity },
    { label: 'Lost Amount', value: formatMoney(downtime?.lostAmount) },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="h4" fontWeight={800}>View Downtime</Typography>
            {downtime?.status && <Chip size="small" label={formatLabel(downtime.status)} color={statusColors[downtime.status] || 'default'} />}
          </Stack>
          <Typography variant="body2" color="text.secondary">{downtime?.equipmentName || 'Downtime details'}</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {canEdit && (
            <Button variant="contained" startIcon={<Edit />} onClick={() => navigate(`/maintenance/downtime/${id}/edit`)}>
              Edit
            </Button>
          )}
          {renderActions(downtime, { canConfirm, canVerify, canClose, canReopen, actionLoading, runAction, id })}
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

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
            <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
              <Tab label="Summary" />
              <Tab label="Production Loss" />
              <Tab label={`RCA Actions (${rcaActions.length})`} />
              <Tab label={`Timeline (${timeline.length})`} />
            </Tabs>

            {tab === 0 && <FieldGrid fields={summaryFields} />}
            {tab === 1 && <FieldGrid fields={lossFields} />}
            {tab === 2 && (
              <Box>
                {canManageRca && (
                  <Box component="form" onSubmit={submitRca} sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}><CommonDropdown label="Action Type" value={rcaForm.actionType} onChange={updateRcaField(setRcaForm, 'actionType')} options={actionTypeOptions} /></Grid>
                      <Grid item xs={12} md={3}><CommonInput type="date" label="Target Date" value={rcaForm.targetDate || ''} onChange={updateRcaField(setRcaForm, 'targetDate')} InputLabelProps={{ shrink: true }} /></Grid>
                      <Grid item xs={12} md={3}><CommonDropdown label="Status" value={rcaForm.status} onChange={updateRcaField(setRcaForm, 'status')} options={rcaStatusOptions} /></Grid>
                      <Grid item xs={12} md={9}><CommonTextArea required minRows={2} label="Action Description" value={rcaForm.description} onChange={updateRcaField(setRcaForm, 'description')} /></Grid>
                      <Grid item xs={12} md={3}>
                        <Stack direction="row" spacing={1}>
                          <Button type="submit" variant="contained" disabled={actionLoading}>{rcaForm.id ? 'Update' : 'Add'}</Button>
                          {rcaForm.id && <Button onClick={() => setRcaForm(initialRcaForm)}>Cancel</Button>}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                <Stack spacing={1.5}>
                  {rcaActions.length === 0 && <Typography variant="body2" color="text.secondary">No RCA actions.</Typography>}
                  {rcaActions.map((action) => (
                    <Box key={action.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800}>{formatLabel(action.actionType)}</Typography>
                          <Typography variant="body2">{action.description}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={formatLabel(action.status)} />
                          {canManageRca && <Button size="small" onClick={() => setRcaForm({ ...initialRcaForm, ...action, targetDate: action.targetDate || '' })}>Edit</Button>}
                        </Stack>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Target: {displayValue(action.targetDate)} | Completed: {displayValue(formatDateTime(action.completedAt))} | Verified: {displayValue(formatDateTime(action.verifiedAt))}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {tab === 3 && (
              <Stack spacing={1.5}>
                {timeline.length === 0 && <Typography variant="body2" color="text.secondary">No timeline entries.</Typography>}
                {timeline.map((item) => (
                  <Box key={item.id} sx={{ borderLeft: '3px solid', borderColor: 'primary.main', pl: 2, py: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={800}>{`${formatLabel(item.action)}: ${formatLabel(item.fromStatus)} -> ${formatLabel(item.toStatus)}`}</Typography>
                    <Typography variant="body2" color="text.secondary">{formatDateTime(item.changedAt)} by {displayValue(item.changedByName)}</Typography>
                    {item.comment && <Typography variant="body2">{item.comment}</Typography>}
                  </Box>
                ))}
              </Stack>
            )}
          </>
        )}

        <Divider sx={{ my: 2 }} />
        <CommonFormActions
          showSave={false}
          onCancel={() => navigate('/maintenance/downtime')}
          cancelLabel="Back"
        />
      </CommonFormCard>
    </Box>
  );
}

function renderActions(downtime, { canConfirm, canVerify, canClose, canReopen, actionLoading, runAction, id }) {
  if (!downtime) return null;
  const status = downtime.status;
  return (
    <>
      {canConfirm && ['OPEN', 'REOPENED'].includes(status) && (
        <Button disabled={actionLoading} startIcon={<CheckCircle />} variant="outlined" onClick={() => runAction('Downtime confirmed.', () => confirmDowntimeEntry(id))}>Confirm</Button>
      )}
      {canConfirm && ['OPEN', 'CONFIRMED', 'REOPENED'].includes(status) && (
        <Button disabled={actionLoading} startIcon={<Build />} variant="outlined" onClick={() => runAction('Maintenance started.', () => startDowntimeMaintenance(id))}>Start</Button>
      )}
      {canVerify && ['OPEN', 'CONFIRMED', 'UNDER_MAINTENANCE', 'REOPENED'].includes(status) && (
        <Button disabled={actionLoading} startIcon={<PlayArrow />} variant="outlined" onClick={() => runAction('Downtime restored.', () => restoreDowntimeEntry(id))}>Restore</Button>
      )}
      {canVerify && status === 'RESTORED' && (
        <Button disabled={actionLoading} startIcon={<Verified />} variant="outlined" onClick={() => runAction('Downtime verified.', () => verifyDowntimeEntry(id))}>Verify</Button>
      )}
      {canClose && status === 'VERIFIED' && (
        <Button disabled={actionLoading} startIcon={<TaskAlt />} variant="outlined" onClick={() => runAction('Downtime closed.', () => closeDowntimeEntry(id))}>Close</Button>
      )}
      {canReopen && status === 'CLOSED' && (
        <Button disabled={actionLoading} startIcon={<Replay />} variant="outlined" onClick={() => runAction('Downtime reopened.', () => reopenDowntimeEntry(id))}>Reopen</Button>
      )}
    </>
  );
}

function FieldGrid({ fields }) {
  return (
    <Grid container spacing={2.5}>
      {fields.map((field) => (
        <Grid item xs={12} sm={field.size || 6} md={field.size || 4} key={field.label}>
          <DetailItem label={field.label} value={field.value} />
        </Grid>
      ))}
    </Grid>
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

function updateRcaField(setRcaForm, field) {
  return (event) => setRcaForm((current) => ({ ...current, [field]: event.target.value }));
}

function displayValue(value) {
  return value === null || value === undefined || value === '' ? '-' : String(value);
}

function formatLabel(value) {
  return value ? String(value).replaceAll('_', ' ') : '-';
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '';
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

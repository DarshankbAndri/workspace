import React from 'react';
import { Alert, Box, Grid, Typography } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createDowntimeEntry, getDowntimeEntryById, getMaintenanceRequestById, getMaintenanceRequests, updateDowntimeEntry } from '../../maintenance/services/maintenanceService';
import { getEquipments } from '../../equipment/services/equipmentService';
import { getSites } from '../../site/services/siteService';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import CommonDateTimePicker from '../../../shared/components/common/CommonDateTimePicker';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';
import { getDropdownOptions } from '../../../shared/utils/dropdownHelper';

const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const reasonCategoryOptions = getDropdownOptions('EQUIPMENT_DOWNTIME', 'reasonCategory');
const plannedOptions = getDropdownOptions('EQUIPMENT_DOWNTIME', 'plannedType');
const noRequestOptions = getDropdownOptions('EQUIPMENT_DOWNTIME', 'noRequestOption');

const initialForm = {
  siteId: '',
  equipmentId: '',
  requestId: '',
  downtimeStart: nowLocal(),
  downtimeEnd: '',
  reason: '',
  reasonCategory: '',
  reasonCode: '',
  rootCause: '',
  productionLine: '',
  shiftName: '',
  operatorName: '',
  expectedOutputPerHour: '',
  lossRatePerUnit: '',
  planned: false,
  remarks: '',
  closureRemarks: '',
};

const calculateDuration = (start, end) => {
  if (!start || !end) return null;
  const minutes = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  return { minutes, hours: Number((minutes / 60).toFixed(2)), days: Number((minutes / 1440).toFixed(2)) };
};

const calculateLoss = (duration, expectedOutputPerHour, lossRatePerUnit) => {
  const output = Number(expectedOutputPerHour || 0);
  const rate = Number(lossRatePerUnit || 0);
  if (!duration || !output) return { lostQuantity: '', lostAmount: '' };
  const lostQuantity = Number((duration.hours * output).toFixed(2));
  const lostAmount = rate ? Number((lostQuantity * rate).toFixed(2)) : '';
  return { lostQuantity, lostAmount };
};

const toNumberOrNull = (value) => (value === '' || value === null || value === undefined ? null : Number(value));

function DowntimeFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && !location.pathname.endsWith('/view');
  const isView = location.pathname.endsWith('/view');
  const requestIdFromQuery = React.useMemo(() => new URLSearchParams(location.search).get('requestId') || '', [location.search]);
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const duration = React.useMemo(() => calculateDuration(form.downtimeStart, form.downtimeEnd), [form.downtimeStart, form.downtimeEnd]);
  const loss = React.useMemo(() => calculateLoss(duration, form.expectedOutputPerHour, form.lossRatePerUnit), [duration, form.expectedOutputPerHour, form.lossRatePerUnit]);

  React.useEffect(() => {
    Promise.all([getSites(), getEquipments(), getMaintenanceRequests()])
      .then(([siteRows, equipmentRows, requestRows]) => {
        setSites((siteRows || []).filter((site) => site.status !== 'INACTIVE'));
        setEquipments(equipmentRows || []);
        setRequests((requestRows || []).filter((request) => !['PENDING_APPROVAL', 'CLOSE_PENDING_APPROVAL', 'REJECTED'].includes(request.status)));
      })
      .catch(() => setError('Unable to load form data.'));
  }, []);

  React.useEffect(() => {
    if (id) {
      getDowntimeEntryById(id)
        .then((data) => setForm({
          ...initialForm,
          ...data,
          siteId: data.siteId || '',
          equipmentId: data.equipmentId || '',
          requestId: data.requestId || '',
          downtimeStart: data.downtimeStart?.slice(0, 16) || '',
          downtimeEnd: data.downtimeEnd?.slice(0, 16) || '',
          planned: Boolean(data.planned),
          expectedOutputPerHour: data.expectedOutputPerHour ?? '',
          lossRatePerUnit: data.lossRatePerUnit ?? '',
        }))
        .catch((err) => setError(err.response?.data?.message || 'Unable to load downtime entry.'));
    }
  }, [id]);

  React.useEffect(() => {
    if (id || !requestIdFromQuery) {
      return;
    }
    getMaintenanceRequestById(requestIdFromQuery)
      .then((request) => setForm((current) => ({
        ...current,
        siteId: request.siteId || '',
        equipmentId: request.equipmentId || '',
        requestId: request.id || requestIdFromQuery,
        reason: current.reason || request.title || '',
        remarks: current.remarks || request.description || '',
      })))
      .catch(() => setError('Unable to load selected request for downtime.'));
  }, [id, requestIdFromQuery]);

  const formEquipments = equipments.filter((equipment) => String(equipment.siteId || '') === String(form.siteId || ''));
  const formRequests = requests.filter((request) => (
    String(request.siteId || '') === String(form.siteId || '') &&
    (!form.equipmentId || String(request.equipmentId || '') === String(form.equipmentId))
  ));
  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSite = (event) => setForm((current) => ({ ...current, siteId: event.target.value, equipmentId: '', requestId: '' }));
  const updateEquipment = (event) => setForm((current) => ({ ...current, equipmentId: event.target.value, requestId: '' }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.downtimeEnd && !duration) {
      setError('End Time must be after Start Time.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        siteId: Number(form.siteId),
        equipmentId: Number(form.equipmentId),
        requestId: form.requestId ? Number(form.requestId) : null,
        downtimeEnd: form.downtimeEnd || null,
        expectedOutputPerHour: toNumberOrNull(form.expectedOutputPerHour),
        lossRatePerUnit: toNumberOrNull(form.lossRatePerUnit),
        planned: Boolean(form.planned),
      };
      if (isEdit) {
        await updateDowntimeEntry(id, payload);
      } else {
        await createDowntimeEntry(payload);
      }
      navigate('/maintenance/downtime');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save downtime entry.');
    } finally {
      setSaving(false);
    }
  };

  const siteOptions = React.useMemo(() => sites.map((s) => ({ value: s.id, label: `${s.siteName} (${s.siteCode})` })), [sites]);
  const equipmentOptions = React.useMemo(() => formEquipments.map((e) => ({ value: e.id, label: `${e.equipmentCode} - ${e.equipmentName}` })), [formEquipments]);
  const requestOptions = React.useMemo(() => [
    ...noRequestOptions,
    ...formRequests.map((r) => ({ value: r.id, label: `${r.requestNumber} - ${r.title}` })),
  ], [formRequests]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>{isView ? 'View Downtime' : isEdit ? 'Edit Downtime' : 'Add Downtime'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <CommonFormCard>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <CommonDropdown required disabled={isView} label="Site" value={form.siteId} onChange={updateSite} options={siteOptions} />
            </Grid>
            <Grid item xs={12} md={4}>
              <CommonDropdown required disabled={isView || !form.siteId} label="Equipment" value={form.equipmentId} onChange={updateEquipment} options={equipmentOptions} />
            </Grid>
            <Grid item xs={12} md={4}>
              <CommonDropdown disabled={isView || !form.siteId || !form.equipmentId} label="Maintenance Request" value={form.requestId} onChange={updateField('requestId')} options={requestOptions} />
            </Grid>
            <Grid item xs={12} md={4}><CommonDropdown disabled={isView} label="Downtime Type" value={form.planned} onChange={updateField('planned')} options={plannedOptions} /></Grid>
            <Grid item xs={12} md={4}><CommonDropdown disabled={isView} label="Reason Category" value={form.reasonCategory || ''} onChange={updateField('reasonCategory')} options={reasonCategoryOptions} clearable /></Grid>
            <Grid item xs={12} md={4}><CommonInput disabled={isView} label="Reason Code" value={form.reasonCode || ''} onChange={updateField('reasonCode')} /></Grid>
            <Grid item xs={12} md={4}><CommonInput required disabled={isView} label="Reason" value={form.reason || ''} onChange={updateField('reason')} /></Grid>
            <Grid item xs={12} md={4}><CommonDateTimePicker required disabled={isView} label="Start Time" value={form.downtimeStart || ''} onChange={updateField('downtimeStart')} /></Grid>
            <Grid item xs={12} md={4}><CommonDateTimePicker disabled={isView} label="End Time" value={form.downtimeEnd || ''} onChange={updateField('downtimeEnd')} /></Grid>
            <Grid item xs={12} md={4}><CommonInput disabled={isView} label="Production Line" value={form.productionLine || ''} onChange={updateField('productionLine')} /></Grid>
            <Grid item xs={12} md={4}><CommonInput disabled={isView} label="Shift" value={form.shiftName || ''} onChange={updateField('shiftName')} /></Grid>
            <Grid item xs={12} md={4}><CommonInput disabled={isView} label="Operator" value={form.operatorName || ''} onChange={updateField('operatorName')} /></Grid>
            <Grid item xs={12} md={4}><CommonInput disabled={isView} type="number" label="Expected Output / Hour" value={form.expectedOutputPerHour || ''} onChange={updateField('expectedOutputPerHour')} inputProps={{ min: 0, step: '0.01' }} /></Grid>
            <Grid item xs={12} md={4}><CommonInput disabled={isView} type="number" label="Loss Rate / Unit" value={form.lossRatePerUnit || ''} onChange={updateField('lossRatePerUnit')} inputProps={{ min: 0, step: '0.01' }} /></Grid>
            <Grid item xs={12} md={4}><CommonInput label="Lost Quantity" value={loss.lostQuantity || form.lostQuantity || ''} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={4}><CommonInput label="Minutes" value={duration?.minutes ?? form.downtimeMinutes ?? ''} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={4}><CommonInput label="Hours" value={duration?.hours ?? form.downtimeHours ?? ''} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={4}><CommonInput label="Lost Amount" value={loss.lostAmount || form.lostAmount || ''} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12}><CommonTextArea disabled={isView} minRows={2} label="Root Cause" value={form.rootCause || ''} onChange={updateField('rootCause')} /></Grid>
            <Grid item xs={12}><CommonTextArea disabled={isView} minRows={2} label="Remarks" value={form.remarks || ''} onChange={updateField('remarks')} /></Grid>
          </Grid>
          <CommonFormActions
            saving={saving}
            showSave={!isView}
            onCancel={() => navigate('/maintenance/downtime')}
            cancelLabel={isView ? 'Back' : 'Cancel'}
          />
        </CommonFormCard>
      </Box>
    </Box>
  );
}

export default DowntimeFormPage;

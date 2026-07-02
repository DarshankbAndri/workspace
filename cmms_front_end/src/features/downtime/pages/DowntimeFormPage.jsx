import React from 'react';
import { Alert, Box, Grid, Typography } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createDowntimeEntry, getDowntimeEntryById, getMaintenanceRequests, updateDowntimeEntry } from '../../maintenance/services/maintenanceService';
import { getEquipments } from '../../equipment/services/equipmentService';
import { getSites } from '../../site/services/siteService';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import CommonDateTimePicker from '../../../shared/components/common/CommonDateTimePicker';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const initialForm = {
  siteId: '',
  equipmentId: '',
  requestId: '',
  downtimeStart: nowLocal(),
  downtimeEnd: '',
  reason: '',
  remarks: '',
};

const calculateDuration = (start, end) => {
  if (!start || !end) return null;
  const minutes = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  return { minutes, hours: Number((minutes / 60).toFixed(2)), days: Number((minutes / 1440).toFixed(2)) };
};

function DowntimeFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && !location.pathname.endsWith('/view');
  const isView = location.pathname.endsWith('/view');
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const duration = React.useMemo(() => calculateDuration(form.downtimeStart, form.downtimeEnd), [form.downtimeStart, form.downtimeEnd]);

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
        }))
        .catch((err) => setError(err.response?.data?.message || 'Unable to load downtime entry.'));
    }
  }, [id]);

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
        planned: false,
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
    { value: '', label: 'No request' },
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
            <Grid item xs={12} md={4}><CommonInput required disabled={isView} label="Reason" value={form.reason || ''} onChange={updateField('reason')} /></Grid>
            <Grid item xs={12} md={4}><CommonDateTimePicker required disabled={isView} label="Start Time" value={form.downtimeStart || ''} onChange={updateField('downtimeStart')} /></Grid>
            <Grid item xs={12} md={4}><CommonDateTimePicker disabled={isView} label="End Time" value={form.downtimeEnd || ''} onChange={updateField('downtimeEnd')} /></Grid>
            <Grid item xs={12} md={4}><CommonInput label="Minutes" value={duration?.minutes ?? form.downtimeMinutes ?? ''} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={4}><CommonInput label="Hours" value={duration?.hours ?? form.downtimeHours ?? ''} InputProps={{ readOnly: true }} /></Grid>
            <Grid item xs={12} md={4}><CommonInput label="Days" value={duration?.days ?? form.downtimeDays ?? ''} InputProps={{ readOnly: true }} /></Grid>
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

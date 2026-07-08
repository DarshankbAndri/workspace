import React from 'react';
import { Alert, Box, Chip, Grid, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createMaintenanceRequest, getMaintenanceRequestById, updateMaintenanceRequest } from '../services/maintenanceRequestService';
import { getEquipments } from '../../equipment/services/equipmentService';
import { getSites } from '../../site/services/siteService';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import CommonDatePicker from '../../../shared/components/common/CommonDatePicker';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

const initialForm = {
  siteId: '',
  equipmentId: '',
  requestType: 'BREAKDOWN',
  priority: 'MEDIUM',
  status: 'OPEN',
  title: '',
  description: '',
  reportedBy: '',
  requestedDate: new Date().toISOString().slice(0, 10),
  targetCompletionDate: '',
};

const REQUEST_TYPE_OPTIONS = [
  { value: 'BREAKDOWN', label: 'Breakdown' },
  { value: 'PREVENTIVE', label: 'Preventive' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'CALIBRATION', label: 'Calibration' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

function MaintenanceRequestFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && !location.pathname.endsWith('/view');
  const isView = location.pathname.endsWith('/view');
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    Promise.all([getSites(), getEquipments()])
      .then(([siteRows, equipmentRows]) => {
        setSites((siteRows || []).filter((site) => site.status !== 'INACTIVE'));
        setEquipments(equipmentRows || []);
      })
      .catch(() => setError('Unable to load form data.'));
  }, []);

  React.useEffect(() => {
    if (id) {
      getMaintenanceRequestById(id)
        .then((data) => setForm({ ...initialForm, ...data, siteId: data.siteId || '', equipmentId: data.equipmentId || '', requestedDate: data.requestedDate || '', targetCompletionDate: data.targetCompletionDate || '' }))
        .catch((err) => setError(err.response?.data?.message || 'Unable to load maintenance request.'));
    }
  }, [id]);

  const formEquipments = equipments.filter((equipment) => String(equipment.siteId || '') === String(form.siteId || ''));
  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSite = (event) => setForm((current) => ({ ...current, siteId: event.target.value, equipmentId: '' }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { status, approvalRequestId, approvalStatus, createdAt, updatedAt, ...editableForm } = form;
      const payload = { ...editableForm, siteId: Number(form.siteId), equipmentId: Number(form.equipmentId) };
      if (isEdit) {
        await updateMaintenanceRequest(id, payload);
      } else {
        await createMaintenanceRequest(payload);
      }
      navigate('/maintenance/requests');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save maintenance request.');
    } finally {
      setSaving(false);
    }
  };

  const siteOptions = React.useMemo(() => sites.map((s) => ({ value: s.id, label: `${s.siteName} (${s.siteCode})` })), [sites]);
  const equipmentOptions = React.useMemo(() => formEquipments.map((e) => ({ value: e.id, label: `${e.equipmentCode} - ${e.equipmentName}` })), [formEquipments]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1 }}>
        <Typography variant="h4" fontWeight={800}>{isView ? 'View Request' : isEdit ? 'Edit Request' : 'Add Request'}</Typography>
        {form.status && <Chip size="small" label={form.status} color={form.status.includes('PENDING') ? 'warning' : form.status === 'REJECTED' ? 'error' : 'default'} />}
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <CommonFormCard>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <CommonDropdown required disabled={isView} label="Site" value={form.siteId} onChange={updateSite} options={siteOptions} />
            </Grid>
            <Grid item xs={12} md={4}>
              <CommonDropdown required disabled={isView || !form.siteId} label="Equipment" value={form.equipmentId} onChange={updateField('equipmentId')} options={equipmentOptions} />
            </Grid>
            <Grid item xs={12} md={4}><CommonInput required disabled={isView} label="Title" value={form.title || ''} onChange={updateField('title')} /></Grid>
            <Grid item xs={12} md={4}><CommonInput disabled={isView} label="Reported By" value={form.reportedBy || ''} onChange={updateField('reportedBy')} /></Grid>
            <Grid item xs={12} md={3}>
              <CommonDropdown disabled={isView} label="Type" value={form.requestType || 'BREAKDOWN'} onChange={updateField('requestType')} options={REQUEST_TYPE_OPTIONS} />
            </Grid>
            <Grid item xs={12} md={3}>
              <CommonDropdown disabled={isView} label="Priority" value={form.priority || 'MEDIUM'} onChange={updateField('priority')} options={PRIORITY_OPTIONS} />
            </Grid>
            <Grid item xs={12} md={3}><CommonDatePicker disabled={isView} label="Requested Date" value={form.requestedDate || ''} onChange={updateField('requestedDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker disabled={isView} label="Target Completion" value={form.targetCompletionDate || ''} onChange={updateField('targetCompletionDate')} /></Grid>
            <Grid item xs={12} md={12}><CommonTextArea required disabled={isView} minRows={2} label="Description" value={form.description || ''} onChange={updateField('description')} /></Grid>
          </Grid>
          <CommonFormActions
            saving={saving}
            showSave={!isView}
            onCancel={() => navigate('/maintenance/requests')}
            cancelLabel={isView ? 'Back' : 'Cancel'}
          />
        </CommonFormCard>
      </Box>
    </Box>
  );
}

export default MaintenanceRequestFormPage;

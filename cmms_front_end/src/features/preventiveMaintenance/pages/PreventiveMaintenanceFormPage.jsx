import React from 'react';
import { Alert, Box, Button, Checkbox, Chip, FormControlLabel, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Add, Delete, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getEquipments } from '../../equipment/services/equipmentService';
import { getSites } from '../../site/services/siteService';
import { getVendorsBySite } from '../../vendor/services/vendorService';
import { createPMSchedule, getPMScheduleById, updatePMSchedule } from '../services/preventiveMaintenanceService';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import CommonDatePicker from '../../../shared/components/common/CommonDatePicker';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  siteId: '',
  equipmentId: '',
  vendorId: '',
  title: '',
  description: '',
  frequency: 'MONTHLY',
  priority: 'MEDIUM',
  assignedTo: '',
  startDate: today(),
  nextDueDate: today(),
  active: 'true',
  status: 'ACTIVE',
  checklistItems: [],
};

const frequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const checklistResponseTypes = ['CHECKBOX', 'TEXT', 'NUMBER', 'PHOTO'];

const FREQUENCY_OPTIONS = frequencies.map((f) => ({ value: f, label: f }));
const PRIORITY_OPTIONS = priorities.map((p) => ({ value: p, label: p }));
const RESPONSE_TYPE_OPTIONS = checklistResponseTypes.map((t) => ({ value: t, label: t }));
const PM_ACTIVE_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];
const PM_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'REJECTED', label: 'Rejected' },
];
const sampleChecklistItems = [
  { taskTitle: 'Inspect oil level', instructions: '', required: true, proofRequired: false, responseType: 'CHECKBOX', active: true },
  { taskTitle: 'Check belt tension', instructions: '', required: true, proofRequired: false, responseType: 'CHECKBOX', active: true },
  { taskTitle: 'Clean filter', instructions: '', required: true, proofRequired: false, responseType: 'CHECKBOX', active: true },
  { taskTitle: 'Record vibration reading', instructions: '', required: true, proofRequired: false, responseType: 'NUMBER', active: true },
  { taskTitle: 'Upload proof/photo', instructions: '', required: true, proofRequired: true, responseType: 'PHOTO', active: true },
];

function PreventiveMaintenanceFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && !location.pathname.endsWith('/view');
  const isView = location.pathname.endsWith('/view');
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
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
      getPMScheduleById(id)
        .then((data) => setForm({
          ...initialForm,
          ...data,
          siteId: data.siteId || '',
          equipmentId: data.equipmentId || '',
          vendorId: data.vendorId || '',
          startDate: data.startDate || today(),
          nextDueDate: data.nextDueDate || data.startDate || today(),
          active: data.active === false ? 'false' : 'true',
          status: data.status || 'ACTIVE',
          checklistItems: data.checklistItems || [],
        }))
        .catch((err) => setError(err.response?.data?.message || 'Unable to load PM schedule.'));
    }
  }, [id]);

  React.useEffect(() => {
    if (!form.siteId) {
      setVendors([]);
      return;
    }
    getVendorsBySite(form.siteId)
      .then((data) => setVendors(data || []))
      .catch(() => setError('Unable to load vendors for selected site.'));
  }, [form.siteId]);

  const filteredEquipments = equipments.filter((equipment) => String(equipment.siteId || '') === String(form.siteId || ''));
  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'startDate' && !isEdit ? { nextDueDate: value } : {}),
    }));
  };
  const updateSite = (event) => setForm((current) => ({ ...current, siteId: event.target.value, equipmentId: '', vendorId: '' }));
  const updateChecklistItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      checklistItems: (current.checklistItems || []).map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  };
  const addChecklistItem = () => {
    setForm((current) => ({
      ...current,
      checklistItems: [
        ...(current.checklistItems || []),
        { taskTitle: '', instructions: '', required: true, proofRequired: false, responseType: 'CHECKBOX', active: true },
      ],
    }));
  };
  const addSampleChecklist = () => {
    setForm((current) => ({
      ...current,
      checklistItems: (current.checklistItems || []).length ? current.checklistItems : sampleChecklistItems,
    }));
  };
  const removeChecklistItem = (index) => {
    setForm((current) => ({
      ...current,
      checklistItems: (current.checklistItems || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };
  const moveChecklistItem = (index, direction) => {
    setForm((current) => {
      const rows = [...(current.checklistItems || [])];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= rows.length) return current;
      [rows[index], rows[targetIndex]] = [rows[targetIndex], rows[index]];
      return { ...current, checklistItems: rows };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        siteId: Number(form.siteId),
        equipmentId: Number(form.equipmentId),
        vendorId: form.vendorId ? Number(form.vendorId) : null,
        active: form.active !== 'false',
        status: form.status || 'ACTIVE',
        checklistItems: (form.checklistItems || [])
          .filter((item) => (item.taskTitle || '').trim())
          .map((item, index) => ({
            ...item,
            sequenceNumber: index + 1,
            taskTitle: item.taskTitle.trim(),
            required: item.required !== false,
            proofRequired: Boolean(item.proofRequired),
            responseType: item.responseType || 'CHECKBOX',
            active: item.active !== false,
          })),
      };
      if (isEdit) {
        await updatePMSchedule(id, payload);
      } else {
        await createPMSchedule(payload);
      }
      navigate('/maintenance/preventive');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save PM schedule.');
    } finally {
      setSaving(false);
    }
  };

  const siteOptions = React.useMemo(() => sites.map((s) => ({ value: s.id, label: `${s.siteName} (${s.siteCode})` })), [sites]);
  const equipmentOptions = React.useMemo(() => filteredEquipments.map((e) => ({ value: e.id, label: `${e.equipmentCode} - ${e.equipmentName}` })), [filteredEquipments]);
  const vendorOptions = React.useMemo(() => [
    { value: '', label: 'Internal team' },
    ...vendors.map((v) => ({ value: v.id, label: v.vendorName })),
  ], [vendors]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1 }}>
        <Typography variant="h4" fontWeight={800}>{isView ? 'View PM Schedule' : isEdit ? 'Edit PM Schedule' : 'Add PM Schedule'}</Typography>
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
              <CommonDropdown
                required
                disabled={isView || !form.siteId}
                label="Equipment"
                value={form.equipmentId}
                onChange={updateField('equipmentId')}
                options={equipmentOptions}
                helperText={form.siteId && filteredEquipments.length === 0 ? 'No equipment found for this site.' : ''}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CommonDropdown
                disabled={isView || !form.siteId}
                label="Assigned Vendor"
                value={form.vendorId}
                onChange={updateField('vendorId')}
                options={vendorOptions}
                helperText={form.siteId && vendors.length === 0 ? 'No vendors assigned to this site.' : ''}
              />
            </Grid>
            <Grid item xs={12} md={4}><CommonInput disabled={isView} label="Assigned To" value={form.assignedTo || ''} onChange={updateField('assignedTo')} /></Grid>
            <Grid item xs={12} md={5}><CommonInput required disabled={isView} label="PM Task" value={form.title || ''} onChange={updateField('title')} /></Grid>
            <Grid item xs={12} md={3}>
              <CommonDropdown required disabled={isView} label="Frequency" value={form.frequency || 'MONTHLY'} onChange={updateField('frequency')} options={FREQUENCY_OPTIONS} />
            </Grid>
            <Grid item xs={12} md={2}>
              <CommonDropdown disabled={isView} label="Priority" value={form.priority || 'MEDIUM'} onChange={updateField('priority')} options={PRIORITY_OPTIONS} />
            </Grid>
            <Grid item xs={12} md={2}>
              <CommonDropdown disabled={isView} label="Status" value={String(form.active)} onChange={updateField('active')} options={PM_ACTIVE_OPTIONS} />
            </Grid>
            <Grid item xs={12} md={2}>
              <CommonDropdown disabled={isView} label="Approval Status" value={form.status || 'ACTIVE'} onChange={updateField('status')} options={PM_STATUS_OPTIONS} />
            </Grid>
            <Grid item xs={12} md={3}><CommonDatePicker required disabled={isView} label="Start Date" value={form.startDate || ''} onChange={updateField('startDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker required disabled={isView} label="Next Due Date" value={form.nextDueDate || ''} onChange={updateField('nextDueDate')} /></Grid>
            <Grid item xs={12} md={6}><CommonTextArea required disabled={isView} minRows={2} label="Description" value={form.description || ''} onChange={updateField('description')} /></Grid>
            <Grid item xs={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1} sx={{ mt: 1 }}>
                <Typography variant="h6" fontWeight={800}>Checklist</Typography>
                {!isView && (
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<Add />} onClick={addSampleChecklist} disabled={(form.checklistItems || []).length > 0}>Samples</Button>
                    <Button variant="contained" startIcon={<Add />} onClick={addChecklistItem}>Add Step</Button>
                  </Stack>
                )}
              </Stack>
            </Grid>
            {(form.checklistItems || []).map((item, index) => (
              <Grid item xs={12} key={`${item.id || 'new'}-${index}`}>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <CommonInput fullWidth required disabled={isView} label={`Step ${index + 1}`} value={item.taskTitle || ''} onChange={(event) => updateChecklistItem(index, 'taskTitle', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <CommonInput fullWidth disabled={isView} label="Instructions" value={item.instructions || ''} onChange={(event) => updateChecklistItem(index, 'instructions', event.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <CommonDropdown
                        disabled={isView}
                        label="Response"
                        value={item.responseType || 'CHECKBOX'}
                        onChange={(event) => updateChecklistItem(index, 'responseType', event.target.value)}
                        options={RESPONSE_TYPE_OPTIONS}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Stack direction="row" spacing={1}>
                        <FormControlLabel control={<Checkbox disabled={isView} checked={item.required !== false} onChange={(event) => updateChecklistItem(index, 'required', event.target.checked)} />} label="Required" />
                        <FormControlLabel control={<Checkbox disabled={isView} checked={Boolean(item.proofRequired)} onChange={(event) => updateChecklistItem(index, 'proofRequired', event.target.checked)} />} label="Proof" />
                      </Stack>
                    </Grid>
                    {!isView && (
                      <Grid item xs={12} md={2}>
                        <Stack direction="row" spacing={0.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                          <Tooltip title="Move up"><span><IconButton disabled={index === 0} onClick={() => moveChecklistItem(index, -1)}><KeyboardArrowUp /></IconButton></span></Tooltip>
                          <Tooltip title="Move down"><span><IconButton disabled={index === (form.checklistItems || []).length - 1} onClick={() => moveChecklistItem(index, 1)}><KeyboardArrowDown /></IconButton></span></Tooltip>
                          <Tooltip title="Remove"><IconButton color="error" onClick={() => removeChecklistItem(index)}><Delete /></IconButton></Tooltip>
                        </Stack>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Grid>
            ))}
          </Grid>
          <CommonFormActions
            saving={saving}
            showSave={!isView}
            onCancel={() => navigate('/maintenance/preventive')}
            cancelLabel={isView ? 'Back' : 'Cancel'}
          />
        </CommonFormCard>
      </Box>
    </Box>
  );
}

export default PreventiveMaintenanceFormPage;

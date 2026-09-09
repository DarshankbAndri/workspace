import React from 'react';
import CommonEquipmentChecklistSelector from '../../../shared/components/common/CommonEquipmentChecklistSelector';
import { checklistApiError } from '../../../shared/utils/checklistSelection';
import { Alert, Box, Chip, Grid, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getEquipments } from '../../equipment/services/equipmentService';
import { getSites } from '../../site/services/siteService';
import { getVendorsBySite } from '../../vendor/services/vendorService';
import { getEquipmentActiveAmc } from '../../vendorAmc/services/vendorAmcService';
import { createPMSchedule, getPMScheduleById, updatePMSchedule } from '../services/preventiveMaintenanceService';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import CommonDatePicker from '../../../shared/components/common/CommonDatePicker';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';
import { getDropdownOptions } from '../../../shared/utils/dropdownHelper';

const today = () => new Date().toISOString().slice(0, 10);

const initialForm = {
  siteId: '',
  equipmentId: '',
  vendorId: '',
  amcContractId: '',
  title: '',
  description: '',
  frequency: 'MONTHLY',
  priority: 'MEDIUM',
  assignedTo: '',
  startDate: today(),
  endDate: '',
  nextDueDate: today(),
  active: 'true',
  status: 'ACTIVE',
  checklistItems: [],
};

const FREQUENCY_OPTIONS = getDropdownOptions('PREVENTIVE_MAINTENANCE', 'frequency');
const PRIORITY_OPTIONS = getDropdownOptions('COMMON', 'criticalityPriority');
const PM_ACTIVE_OPTIONS = getDropdownOptions('PREVENTIVE_MAINTENANCE', 'active');
const PM_STATUS_OPTIONS = getDropdownOptions('PREVENTIVE_MAINTENANCE', 'approvalStatus');
const INTERNAL_TEAM_OPTIONS = getDropdownOptions('PREVENTIVE_MAINTENANCE', 'internalTeamOption');
const AMC_NOT_LINKED_OPTIONS = getDropdownOptions('PREVENTIVE_MAINTENANCE', 'amcNotLinkedOption');
const AMC_LOADING_OPTIONS = getDropdownOptions('PREVENTIVE_MAINTENANCE', 'amcLoadingOption');
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
  const [activeAmc, setActiveAmc] = React.useState(null);
  const [amcLoading, setAmcLoading] = React.useState(false);
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
          amcContractId: data.amcContractId || '',
          startDate: data.startDate || today(),
          endDate: data.endDate || '',
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

  React.useEffect(() => {
    if (!form.equipmentId) {
      setActiveAmc(null);
      setAmcLoading(false);
      return;
    }
    setAmcLoading(true);
    getEquipmentActiveAmc(form.equipmentId)
      .then((data) => setActiveAmc(data || null))
      .catch(() => setActiveAmc(null))
      .finally(() => setAmcLoading(false));
  }, [form.equipmentId]);

  const filteredEquipments = equipments.filter((equipment) => String(equipment.siteId || '') === String(form.siteId || ''));
  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'startDate' && !isEdit ? { nextDueDate: value } : {}),
    }));
  };
  const confirmChecklistClear = () => !(form.checklistItems || []).length || window.confirm('Changing equipment clears the selected checklist steps, including custom steps. Continue?');
  const updateSite = (event) => {
    if (String(event.target.value) === String(form.siteId)) return;
    if (!confirmChecklistClear()) return;
    setForm(current => ({ ...current, siteId: event.target.value, equipmentId: '', vendorId: '', amcContractId: '', checklistItems: [] }));
  };
  const updateEquipment = (event) => {
    if (String(event.target.value) === String(form.equipmentId)) return;
    if (!confirmChecklistClear()) return;
    setForm(current => ({ ...current, equipmentId: event.target.value, amcContractId: '', checklistItems: [] }));
  };
  const updateAmcContract = (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      amcContractId: value,
      ...(value && activeAmc ? { vendorId: activeAmc.vendorId || current.vendorId } : {}),
    }));
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
        amcContractId: form.amcContractId ? Number(form.amcContractId) : null,
        endDate: form.endDate || null,
        active: form.active !== 'false',
        status: form.status || 'ACTIVE',
        checklistItems: (form.checklistItems || [])
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
      setError(checklistApiError(err, 'Unable to save PM schedule.'));
    } finally {
      setSaving(false);
    }
  };

  const siteOptions = React.useMemo(() => sites.map((s) => ({ value: s.id, label: `${s.siteName} (${s.siteCode})` })), [sites]);
  const equipmentOptions = React.useMemo(() => filteredEquipments.map((e) => ({ value: e.id, label: `${e.equipmentCode} - ${e.equipmentName}` })), [filteredEquipments]);
  const vendorOptions = React.useMemo(() => [
    ...INTERNAL_TEAM_OPTIONS,
    ...vendors.map((v) => ({ value: v.id, label: v.vendorName })),
  ], [vendors]);
  const amcOptions = React.useMemo(() => {
    const options = [...(amcLoading ? AMC_LOADING_OPTIONS : AMC_NOT_LINKED_OPTIONS)];
    if (activeAmc?.id) {
      options.push({ value: activeAmc.id, label: `${activeAmc.contractNumber || 'AMC'} - ${activeAmc.vendorName || 'Vendor'}` });
    }
    if (form.amcContractId && String(form.amcContractId) !== String(activeAmc?.id || '')) {
      options.push({ value: form.amcContractId, label: `${form.amcContractNumber || 'Linked AMC'} - ${form.amcVendorName || form.vendorName || 'Vendor'}` });
    }
    return options;
  }, [activeAmc, amcLoading, form.amcContractId, form.amcContractNumber, form.amcVendorName, form.vendorName]);

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
                onChange={updateEquipment}
                options={equipmentOptions}
                helperText={form.siteId && filteredEquipments.length === 0 ? 'No equipment found for this site.' : ''}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CommonDropdown
                disabled={isView || !form.equipmentId || amcLoading || (!activeAmc && !form.amcContractId)}
                label="AMC Coverage"
                value={form.amcContractId}
                onChange={updateAmcContract}
                options={amcOptions}
                helperText={form.equipmentId && !amcLoading && !activeAmc && !form.amcContractId ? 'No active AMC found for this equipment.' : ''}
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
            <Grid item xs={12} md={3}><CommonDatePicker disabled={isView} label="End Date" value={form.endDate || ''} onChange={updateField('endDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker required disabled={isView} label="Next Due Date" value={form.nextDueDate || ''} onChange={updateField('nextDueDate')} /></Grid>
            <Grid item xs={12}><CommonTextArea required disabled={isView} minRows={2} label="Description" value={form.description || ''} onChange={updateField('description')} /></Grid>
            <Grid item xs={12}>
              <CommonEquipmentChecklistSelector equipmentId={form.equipmentId} items={form.checklistItems || []} readOnly={isView} onChange={checklistItems => setForm(current => ({ ...current, checklistItems }))} />
            </Grid>
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

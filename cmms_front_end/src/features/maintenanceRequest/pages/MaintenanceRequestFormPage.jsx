import React from 'react';
import { Alert, Box, Chip, Grid, Stack, Typography } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createMaintenanceRequest, getMaintenanceRequestById, getRequestContext, updateMaintenanceRequest } from '../services/maintenanceRequestService';
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
  amcContractId: '',
  amcCovered: false,
  externalVendorAssignment: false,
  vendorId: '',
  vendorReferenceNumber: '',
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
  const [activeAmc, setActiveAmc] = React.useState(null);
  const [requestContext, setRequestContext] = React.useState(null);
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

  React.useEffect(() => {
    if (!form.equipmentId) {
      setActiveAmc(null);
      setRequestContext(null);
      return;
    }
    loadRequestContext(form.equipmentId);
  }, [form.equipmentId]);

  const formEquipments = equipments.filter((equipment) => String(equipment.siteId || '') === String(form.siteId || ''));
  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSite = (event) => {
    setActiveAmc(null);
    setRequestContext(null);
    setForm((current) => ({ ...current, siteId: event.target.value, equipmentId: '', amcContractId: '', amcCovered: false, externalVendorAssignment: false, vendorId: '' }));
  };
  const updateEquipment = (event) => {
    const equipmentId = event.target.value;
    setActiveAmc(null);
    setRequestContext(null);
    setForm((current) => ({ ...current, equipmentId, amcContractId: '', amcCovered: false, externalVendorAssignment: false, vendorId: '' }));
  };

  const loadRequestContext = (equipmentId) => {
    getRequestContext(equipmentId)
      .then((data) => {
        setRequestContext(data || null);
        const amc = data?.activeAmcContractId ? {
          id: data.activeAmcContractId,
          contractNumber: data.activeAmcContractNumber,
          vendorId: data.vendorId,
          vendorName: data.vendorName,
          responseTimeHours: data.responseTimeHours,
          resolutionTimeHours: data.resolutionTimeHours,
          endDate: data.amcEndDate,
        } : null;
        setActiveAmc(amc);
        if (amc) {
          setForm((current) => ({
            ...current,
            amcContractId: amc.id,
            amcCovered: true,
          }));
        }
      })
      .catch(() => {
        setRequestContext(null);
        setActiveAmc(null);
      });
  };
  const updateAssignToAmcVendor = (event) => {
    const enabled = event.target.value === true || event.target.value === 'true';
    setForm((current) => ({
      ...current,
      externalVendorAssignment: enabled,
      vendorId: enabled ? activeAmc?.vendorId || '' : '',
      amcContractId: enabled ? activeAmc?.id || current.amcContractId : current.amcContractId,
      amcCovered: enabled || Boolean(activeAmc),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { status, approvalRequestId, approvalStatus, createdAt, updatedAt, vendorName, amcContractNumber, ...editableForm } = form;
      const payload = {
        ...editableForm,
        siteId: Number(form.siteId),
        equipmentId: Number(form.equipmentId),
        amcContractId: form.amcContractId ? Number(form.amcContractId) : null,
        vendorId: form.vendorId ? Number(form.vendorId) : null,
        amcCovered: Boolean(form.amcContractId),
        externalVendorAssignment: Boolean(form.externalVendorAssignment),
      };
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
              <CommonDropdown required disabled={isView || !form.siteId} label="Equipment" value={form.equipmentId} onChange={updateEquipment} options={equipmentOptions} />
            </Grid>
            {activeAmc && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography fontWeight={800}>AMC Available: Yes</Typography>
                  <Typography variant="body2">
                    {activeAmc.vendorName} | {activeAmc.contractNumber} | Valid until {activeAmc.endDate} | Response SLA {activeAmc.responseTimeHours || '-'} hr | Resolution SLA {activeAmc.resolutionTimeHours || '-'} hr
                  </Typography>
                </Alert>
              </Grid>
            )}
            {requestContext?.openRequestCount > 0 && !isEdit && (
              <Grid item xs={12}>
                <Alert
                  severity="warning"
                  action={requestContext.latestOpenRequestId ? (
                    <Chip
                      clickable
                      size="small"
                      label={`Open ${requestContext.latestOpenRequestNumber || 'latest request'}`}
                      onClick={() => navigate(`/maintenance/requests/${requestContext.latestOpenRequestId}/view`)}
                    />
                  ) : null}
                >
                  This equipment already has {requestContext.openRequestCount} open request{requestContext.openRequestCount === 1 ? '' : 's'}.
                </Alert>
              </Grid>
            )}
            {requestContext && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>Equipment Context</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}><ContextItem label="Equipment" value={`${requestContext.equipmentCode || ''} ${requestContext.equipmentName || ''}`.trim()} /></Grid>
                    <Grid item xs={12} md={3}><ContextItem label="Status" value={`${requestContext.operatingStatus || '-'} / ${requestContext.healthStatus || '-'}`} /></Grid>
                    <Grid item xs={12} md={3}><ContextItem label="Open Requests" value={requestContext.openRequestCount} /></Grid>
                    <Grid item xs={12} md={3}><ContextItem label="Spare BOM" value={requestContext.spareBomCount} /></Grid>
                    <Grid item xs={12} md={3}><ContextItem label="Last Maintenance" value={requestContext.lastMaintenanceDate} /></Grid>
                    <Grid item xs={12} md={3}><ContextItem label="Next PM" value={requestContext.nextPmDate} /></Grid>
                    <Grid item xs={12} md={3}><ContextItem label="AMC" value={requestContext.activeAmcContractNumber || 'No active AMC'} /></Grid>
                    <Grid item xs={12} md={3}><ContextItem label="Vendor" value={requestContext.vendorName || '-'} /></Grid>
                  </Grid>
                </Box>
              </Grid>
            )}
            {activeAmc && (
              <Grid item xs={12} md={4}>
                <CommonDropdown
                  disabled={isView}
                  label="Assign to AMC Vendor"
                  value={form.externalVendorAssignment}
                  onChange={updateAssignToAmcVendor}
                  options={[{ value: true, label: 'Yes' }, { value: false, label: 'No' }]}
                />
              </Grid>
            )}
            {activeAmc && form.externalVendorAssignment && (
              <Grid item xs={12} md={4}>
                <CommonInput disabled label="AMC Vendor" value={activeAmc.vendorName || ''} />
              </Grid>
            )}
            {activeAmc && (
              <Grid item xs={12} md={4}>
                <CommonInput disabled={isView} label="Vendor Reference Number" value={form.vendorReferenceNumber || ''} onChange={updateField('vendorReferenceNumber')} />
              </Grid>
            )}
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

function ContextItem({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={800}>{label}</Typography>
      <Typography variant="body2" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
        {value === null || value === undefined || value === '' ? '-' : String(value)}
      </Typography>
    </Box>
  );
}

export default MaintenanceRequestFormPage;

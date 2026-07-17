import React from 'react';
import { Alert, Box, Grid, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonDatePicker from '../../../shared/components/common/CommonDatePicker';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import { getVendors } from '../../vendor/services/vendorService';
import { getEquipments } from '../../equipment/services/equipmentService';
import {
  createVendorAmcContract,
  getVendorAmcContract,
  getVendorAmcEquipment,
  mapVendorAmcEquipment,
  removeVendorAmcEquipment,
  updateVendorAmcContract,
} from '../services/vendorAmcService';

const initialForm = {
  vendorId: '',
  contractNumber: '',
  contractName: '',
  contractType: 'COMPREHENSIVE',
  startDate: '',
  endDate: '',
  contractValue: '',
  coverageDescription: '',
  responseTimeHours: '',
  resolutionTimeHours: '',
  includesLabor: true,
  includesSpares: false,
  status: 'ACTIVE',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  remarks: '',
  equipmentIds: [],
};

const statusOptions = ['DRAFT', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'TERMINATED', 'RENEWED'].map((value) => ({ value, label: value.replaceAll('_', ' ') }));
const contractTypeOptions = ['COMPREHENSIVE', 'LABOR_ONLY', 'SPARES_ONLY', 'INSPECTION', 'OTHER'].map((value) => ({ value, label: value.replaceAll('_', ' ') }));
const yesNoOptions = [{ value: true, label: 'Yes' }, { value: false, label: 'No' }];

function VendorAmcFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = React.useState(initialForm);
  const [vendors, setVendors] = React.useState([]);
  const [equipments, setEquipments] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    Promise.all([getVendors({ status: 'ACTIVE' }), getEquipments()])
      .then(([vendorRows, equipmentRows]) => {
        setVendors((vendorRows || []).filter((vendor) => vendor.active !== false));
        setEquipments((equipmentRows || []).filter((equipment) => equipment.status !== 'INACTIVE'));
      })
      .catch(() => setError('Unable to load vendor or equipment options.'));
  }, []);

  React.useEffect(() => {
    if (!isEdit) return;
    getVendorAmcContract(id)
      .then((data) => setForm({
        ...initialForm,
        ...data,
        vendorId: data.vendorId || '',
        contractValue: data.contractValue ?? '',
        responseTimeHours: data.responseTimeHours ?? '',
        resolutionTimeHours: data.resolutionTimeHours ?? '',
        equipmentIds: (data.equipmentMappings || []).filter((mapping) => mapping.active !== false).map((mapping) => mapping.equipmentId),
      }))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load AMC contract.'));
  }, [id, isEdit]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateBoolean = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value === true || event.target.value === 'true' }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = toPayload(form);
      const saved = isEdit ? await updateVendorAmcContract(id, payload) : await createVendorAmcContract(payloadWithMappings(payload, form.equipmentIds));
      if (isEdit) {
        await syncEquipmentMappings(id, form.equipmentIds, form);
      }
      navigate(`/vendor-amc/view/${saved.id || id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.apiError?.message || 'Unable to save AMC contract.');
    } finally {
      setSaving(false);
    }
  };

  const vendorOptions = React.useMemo(() => vendors.map((vendor) => ({ value: vendor.id, label: `${vendor.vendorCode} - ${vendor.vendorName}` })), [vendors]);
  const equipmentOptions = React.useMemo(() => equipments.map((equipment) => ({ value: equipment.id, label: `${equipment.equipmentCode} - ${equipment.equipmentName}` })), [equipments]);

  return (
    <Box>
      <Stack sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800}>{isEdit ? 'Edit AMC Contract' : 'Create AMC Contract'}</Typography>
        <Typography variant="body2" color="text.secondary">Capture vendor contract terms and covered equipment.</Typography>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <CommonFormCard>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><CommonDropdown required label="Vendor" value={form.vendorId} onChange={updateField('vendorId')} options={vendorOptions} /></Grid>
            <Grid item xs={12} md={4}><CommonInput required label="Contract Number" value={form.contractNumber} onChange={updateField('contractNumber')} /></Grid>
            <Grid item xs={12} md={4}><CommonInput required label="Contract Name" value={form.contractName} onChange={updateField('contractName')} /></Grid>
            <Grid item xs={12} md={3}><CommonDropdown label="Contract Type" value={form.contractType} onChange={updateField('contractType')} options={contractTypeOptions} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker required label="Start Date" value={form.startDate || ''} onChange={updateField('startDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonDatePicker required label="End Date" value={form.endDate || ''} onChange={updateField('endDate')} /></Grid>
            <Grid item xs={12} md={3}><CommonDropdown label="Status" value={form.status} onChange={updateField('status')} options={statusOptions} /></Grid>
            <Grid item xs={12} md={3}><CommonInput label="Contract Value" type="number" value={form.contractValue} onChange={updateField('contractValue')} /></Grid>
            <Grid item xs={12} md={3}><CommonInput label="Response Time (Hours)" type="number" value={form.responseTimeHours} onChange={updateField('responseTimeHours')} /></Grid>
            <Grid item xs={12} md={3}><CommonInput label="Resolution Time (Hours)" type="number" value={form.resolutionTimeHours} onChange={updateField('resolutionTimeHours')} /></Grid>
            <Grid item xs={12} md={3}><CommonDropdown label="Labor Included" value={form.includesLabor} onChange={updateBoolean('includesLabor')} options={yesNoOptions} /></Grid>
            <Grid item xs={12} md={3}><CommonDropdown label="Spares Included" value={form.includesSpares} onChange={updateBoolean('includesSpares')} options={yesNoOptions} /></Grid>
            <Grid item xs={12} md={3}><CommonInput label="Contact Person" value={form.contactPerson || ''} onChange={updateField('contactPerson')} /></Grid>
            <Grid item xs={12} md={3}><CommonInput label="Contact Phone" value={form.contactPhone || ''} onChange={updateField('contactPhone')} /></Grid>
            <Grid item xs={12} md={3}><CommonInput label="Contact Email" value={form.contactEmail || ''} onChange={updateField('contactEmail')} /></Grid>
            <Grid item xs={12}><CommonDropdown multiple label="Covered Equipment" value={form.equipmentIds} onChange={updateField('equipmentIds')} options={equipmentOptions} /></Grid>
            <Grid item xs={12} md={6}><CommonTextArea label="Coverage Description" minRows={3} value={form.coverageDescription || ''} onChange={updateField('coverageDescription')} /></Grid>
            <Grid item xs={12} md={6}><CommonTextArea label="Remarks" minRows={3} value={form.remarks || ''} onChange={updateField('remarks')} /></Grid>
          </Grid>
          <CommonFormActions saving={saving} onCancel={() => navigate('/vendor-amc')} />
        </CommonFormCard>
      </Box>
    </Box>
  );
}

function toPayload(form) {
  return {
    ...form,
    vendorId: Number(form.vendorId),
    contractValue: form.contractValue === '' ? null : Number(form.contractValue),
    responseTimeHours: form.responseTimeHours === '' ? null : Number(form.responseTimeHours),
    resolutionTimeHours: form.resolutionTimeHours === '' ? null : Number(form.resolutionTimeHours),
    equipmentMappings: [],
  };
}

function payloadWithMappings(payload, equipmentIds) {
  return {
    ...payload,
    equipmentMappings: (equipmentIds || []).map((equipmentId) => ({
      equipmentId: Number(equipmentId),
      coverageType: 'FULL',
      coverageStartDate: payload.startDate,
      coverageEndDate: payload.endDate,
      active: true,
    })),
  };
}

async function syncEquipmentMappings(contractId, nextEquipmentIds, form) {
  const currentMappings = await getVendorAmcEquipment(contractId);
  const currentIds = new Set((currentMappings || []).filter((mapping) => mapping.active !== false).map((mapping) => String(mapping.equipmentId)));
  const nextIds = new Set((nextEquipmentIds || []).map((equipmentId) => String(equipmentId)));
  await Promise.all([...nextIds].filter((equipmentId) => !currentIds.has(equipmentId)).map((equipmentId) => mapVendorAmcEquipment(contractId, {
    equipmentId: Number(equipmentId),
    coverageType: 'FULL',
    coverageStartDate: form.startDate,
    coverageEndDate: form.endDate,
    active: true,
  })));
  await Promise.all([...currentIds].filter((equipmentId) => !nextIds.has(equipmentId)).map((equipmentId) => removeVendorAmcEquipment(contractId, equipmentId)));
}

export default VendorAmcFormPage;

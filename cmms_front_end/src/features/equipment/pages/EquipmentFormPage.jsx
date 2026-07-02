import React from 'react';
import { Alert, Box, Grid, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createEquipment, getEquipmentById, updateEquipment } from '../services/equipmentService';
import { getSites } from '../../site/services/siteService';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonDatePicker from '../../../shared/components/common/CommonDatePicker';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

const initialForm = {
  equipmentCode: '',
  equipmentName: '',
  siteId: '',
  category: '',
  location: '',
  manufacturer: '',
  modelNumber: '',
  serialNumber: '',
  installationDate: '',
  warrantyExpiryDate: '',
  status: 'ACTIVE',
  criticality: 'MEDIUM',
};

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
  { value: 'RETIRED', label: 'Retired' },
];

const CRITICALITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

function EquipmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getSites().then((data) => setSites(data.filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  React.useEffect(() => {
    if (isEdit) {
      getEquipmentById(id).then((data) => setForm({ ...initialForm, ...data })).catch(() => setError('Unable to load equipment.'));
    }
  }, [id, isEdit]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, siteId: Number(form.siteId) };
      if (isEdit) {
        await updateEquipment(id, payload);
      } else {
        await createEquipment(payload);
      }
      navigate('/equipment');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save equipment.');
    } finally {
      setSaving(false);
    }
  };

  const siteOptions = React.useMemo(
    () => sites.map((s) => ({ value: s.id, label: `${s.siteName} (${s.siteCode})` })),
    [sites],
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>{isEdit ? 'Edit Equipment' : 'Add Equipment'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <CommonFormCard component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><CommonInput required label="Equipment Code" value={form.equipmentCode} onChange={updateField('equipmentCode')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput required label="Equipment Name" value={form.equipmentName} onChange={updateField('equipmentName')} /></Grid>
          <Grid item xs={12} md={4}>
            <CommonDropdown required label="Site" value={form.siteId || ''} onChange={updateField('siteId')} options={siteOptions} />
          </Grid>
          <Grid item xs={12} md={4}><CommonInput required label="Category" value={form.category} onChange={updateField('category')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput label="Location" value={form.location || ''} onChange={updateField('location')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput label="Manufacturer" value={form.manufacturer || ''} onChange={updateField('manufacturer')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput label="Model Number" value={form.modelNumber || ''} onChange={updateField('modelNumber')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput label="Serial Number" value={form.serialNumber || ''} onChange={updateField('serialNumber')} /></Grid>
          <Grid item xs={12} md={4}>
            <CommonDropdown label="Status" value={form.status || 'ACTIVE'} onChange={updateField('status')} options={STATUS_OPTIONS} />
          </Grid>
          <Grid item xs={12} md={4}><CommonDatePicker label="Installation Date" value={form.installationDate || ''} onChange={updateField('installationDate')} /></Grid>
          <Grid item xs={12} md={4}><CommonDatePicker label="Warranty Expiry" value={form.warrantyExpiryDate || ''} onChange={updateField('warrantyExpiryDate')} /></Grid>
          <Grid item xs={12} md={4}>
            <CommonDropdown label="Criticality" value={form.criticality || 'MEDIUM'} onChange={updateField('criticality')} options={CRITICALITY_OPTIONS} />
          </Grid>
        </Grid>
        <CommonFormActions saving={saving} onCancel={() => navigate('/equipment')} />
      </CommonFormCard>
    </Box>
  );
}

export default EquipmentFormPage;

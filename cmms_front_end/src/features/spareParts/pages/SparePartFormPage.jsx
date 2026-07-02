import React from 'react';
import { Alert, Box, Grid, Typography } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createSparePart, getSparePartById, updateSparePart } from '../services/sparePartService';
import { getSites } from '../../site/services/siteService';
import { getVendorsBySite } from '../../vendor/services/vendorService';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

const initialForm = {
  partCode: '',
  partName: '',
  description: '',
  category: '',
  unit: 'PCS',
  preferredVendorId: '',
  siteId: '',
  currentStock: 0,
  minimumStock: 0,
  unitCost: 0,
  storageLocation: '',
  status: 'ACTIVE',
};

const SPARE_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

function SparePartFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && !location.pathname.endsWith('/view');
  const isView = location.pathname.endsWith('/view');
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [vendors, setVendors] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getSites()
      .then((data) => setSites((data || []).filter((site) => site.status !== 'INACTIVE')))
      .catch(() => setError('Unable to load sites.'));
  }, []);

  React.useEffect(() => {
    if (id) {
      getSparePartById(id)
        .then((data) => setForm({
          ...initialForm,
          ...data,
          preferredVendorId: data.preferredVendorId || '',
          siteId: data.siteId || '',
          currentStock: data.currentStock ?? 0,
          minimumStock: data.minimumStock ?? 0,
          unitCost: data.unitCost ?? 0,
        }))
        .catch((err) => setError(err.response?.data?.message || 'Unable to load spare part.'));
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

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSite = (event) => setForm((current) => ({ ...current, siteId: event.target.value, preferredVendorId: '' }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        siteId: Number(form.siteId),
        preferredVendorId: form.preferredVendorId ? Number(form.preferredVendorId) : null,
        currentStock: Number(form.currentStock || 0),
        minimumStock: Number(form.minimumStock || 0),
        unitCost: Number(form.unitCost || 0),
      };
      if (isEdit) {
        await updateSparePart(id, payload);
      } else {
        await createSparePart(payload);
      }
      navigate('/inventory/spare-parts');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save spare part.');
    } finally {
      setSaving(false);
    }
  };

  const siteOptions = React.useMemo(() => sites.map((s) => ({ value: s.id, label: `${s.siteName} (${s.siteCode})` })), [sites]);
  const vendorOptions = React.useMemo(() => [
    { value: '', label: 'No preferred vendor' },
    ...vendors.map((v) => ({ value: v.id, label: v.vendorName })),
  ], [vendors]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>{isView ? 'View Spare Part' : isEdit ? 'Edit Spare Part' : 'Add Spare Part'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <CommonFormCard component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><CommonInput required disabled={isView || isEdit} label="Part Code" value={form.partCode || ''} onChange={updateField('partCode')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput required disabled={isView} label="Part Name" value={form.partName || ''} onChange={updateField('partName')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput required disabled={isView} label="Unit" value={form.unit || ''} onChange={updateField('unit')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput disabled={isView} label="Category" value={form.category || ''} onChange={updateField('category')} /></Grid>
          <Grid item xs={12} md={4}>
            <CommonDropdown required disabled={isView || isEdit} label="Site" value={form.siteId || ''} onChange={updateSite} options={siteOptions} />
          </Grid>
          <Grid item xs={12} md={4}>
            <CommonDropdown disabled={isView || !form.siteId} label="Preferred Vendor" value={form.preferredVendorId || ''} onChange={updateField('preferredVendorId')} options={vendorOptions} />
          </Grid>
          <Grid item xs={12} md={3}><CommonInput type="number" disabled={isView || isEdit} label="Opening Stock" value={form.currentStock ?? 0} onChange={updateField('currentStock')} /></Grid>
          <Grid item xs={12} md={3}><CommonInput type="number" disabled={isView} label="Minimum Stock" value={form.minimumStock ?? 0} onChange={updateField('minimumStock')} /></Grid>
          <Grid item xs={12} md={3}><CommonInput type="number" disabled={isView} label="Unit Cost" value={form.unitCost ?? 0} onChange={updateField('unitCost')} /></Grid>
          <Grid item xs={12} md={3}>
            <CommonDropdown disabled={isView} label="Status" value={form.status || 'ACTIVE'} onChange={updateField('status')} options={SPARE_STATUS_OPTIONS} />
          </Grid>
          <Grid item xs={12} md={6}><CommonInput disabled={isView} label="Storage Location" value={form.storageLocation || ''} onChange={updateField('storageLocation')} /></Grid>
          <Grid item xs={12} md={6}><CommonTextArea disabled={isView} minRows={2} label="Description" value={form.description || ''} onChange={updateField('description')} /></Grid>
        </Grid>
        <CommonFormActions
          saving={saving}
          showSave={!isView}
          onCancel={() => navigate('/inventory/spare-parts')}
          cancelLabel={isView ? 'Back' : 'Cancel'}
        />
      </CommonFormCard>
    </Box>
  );
}

export default SparePartFormPage;

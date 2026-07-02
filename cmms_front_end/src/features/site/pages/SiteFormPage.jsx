import React from 'react';
import { Alert, Box, Grid, Snackbar, Typography } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createSite, getSiteById, updateSite } from '../services/siteService';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';

const initialForm = {
  siteCode: '',
  siteName: '',
  organizationName: '',
  siteType: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  contactPerson: '',
  contactMobile: '',
  contactEmail: '',
  latitude: '',
  longitude: '',
  status: 'ACTIVE',
};

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

function SiteFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const viewOnly = Boolean(location.state?.viewOnly) || location.pathname.endsWith('/view');
  const [form, setForm] = React.useState(initialForm);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState('');

  React.useEffect(() => {
    if (isEdit) {
      getSiteById(id).then((data) => setForm({ ...initialForm, ...data })).catch(() => setError('Unable to load site.'));
    }
  }, [id, isEdit]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
      };
      if (isEdit) {
        await updateSite(id, payload);
      } else {
        await createSite(payload);
      }
      setSnackbar('Site saved.');
      navigate('/hr/sites');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save site.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>{viewOnly ? 'View Site' : isEdit ? 'Edit Site' : 'Add Site'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <CommonFormCard component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><CommonInput required disabled={viewOnly} label="Site Code" value={form.siteCode} onChange={updateField('siteCode')} /></Grid>
          <Grid item xs={12} md={8}><CommonInput required disabled={viewOnly} label="Site Name" value={form.siteName} onChange={updateField('siteName')} /></Grid>
          <Grid item xs={12} md={6}><CommonInput disabled={viewOnly} label="Organization Name" value={form.organizationName || ''} onChange={updateField('organizationName')} /></Grid>
          <Grid item xs={12} md={3}><CommonInput disabled={viewOnly} label="Site Type" value={form.siteType || ''} onChange={updateField('siteType')} /></Grid>
          <Grid item xs={12} md={3}>
            <CommonDropdown disabled={viewOnly} label="Status" value={form.status || 'ACTIVE'} onChange={updateField('status')} options={STATUS_OPTIONS} />
          </Grid>
          <Grid item xs={12} md={6}><CommonInput disabled={viewOnly} label="Address Line 1" value={form.addressLine1 || ''} onChange={updateField('addressLine1')} /></Grid>
          <Grid item xs={12} md={6}><CommonInput disabled={viewOnly} label="Address Line 2" value={form.addressLine2 || ''} onChange={updateField('addressLine2')} /></Grid>
          <Grid item xs={12} md={3}><CommonInput disabled={viewOnly} label="City" value={form.city || ''} onChange={updateField('city')} /></Grid>
          <Grid item xs={12} md={3}><CommonInput disabled={viewOnly} label="State" value={form.state || ''} onChange={updateField('state')} /></Grid>
          <Grid item xs={12} md={3}><CommonInput disabled={viewOnly} label="Country" value={form.country || ''} onChange={updateField('country')} /></Grid>
          <Grid item xs={12} md={3}><CommonInput disabled={viewOnly} label="Pincode" value={form.pincode || ''} onChange={updateField('pincode')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput disabled={viewOnly} label="Contact Person" value={form.contactPerson || ''} onChange={updateField('contactPerson')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput disabled={viewOnly} label="Contact Mobile" value={form.contactMobile || ''} onChange={updateField('contactMobile')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput type="email" disabled={viewOnly} label="Contact Email" value={form.contactEmail || ''} onChange={updateField('contactEmail')} /></Grid>
          <Grid item xs={12} md={3}><CommonInput type="number" disabled={viewOnly} label="Latitude" value={form.latitude || ''} onChange={updateField('latitude')} /></Grid>
          <Grid item xs={12} md={3}><CommonInput type="number" disabled={viewOnly} label="Longitude" value={form.longitude || ''} onChange={updateField('longitude')} /></Grid>
        </Grid>
        <CommonFormActions
          saving={saving}
          showSave={!viewOnly}
          onCancel={() => navigate('/hr/sites')}
          cancelLabel={viewOnly ? 'Back' : 'Cancel'}
        />
      </CommonFormCard>
      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} message={snackbar} onClose={() => setSnackbar('')} />
    </Box>
  );
}

export default SiteFormPage;

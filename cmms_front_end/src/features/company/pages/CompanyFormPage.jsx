import React from 'react';
import { Alert, Box, Grid, Stack, Typography } from '@mui/material';
import { useAuth } from '../../../shared/context/AuthContext';
import { PERMISSIONS } from '../../../shared/utils/permissionRoutes';
import { createCompany, getCurrentCompany, resolveCompanyLogoUrl, updateCompany, uploadCompanyLogo } from '../services/companyService';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';
import CommonFileUpload from '../../../shared/components/common/CommonFileUpload';

const initialForm = {
  companyName: '',
  companyCode: '',
  email: '',
  phoneNumber: '',
  address: '',
  status: 'ACTIVE',
  logoUrl: '',
};

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'INACTIVE', label: 'INACTIVE' },
];

function CompanyFormPage() {
  const { hasPermission } = useAuth();
  const [form, setForm] = React.useState(initialForm);
  const [logoFile, setLogoFile] = React.useState(null);
  const [logoPreview, setLogoPreview] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getCurrentCompany()
      .then((data) => {
        if (data) {
          setForm({ ...initialForm, ...data, status: data.status || 'ACTIVE' });
          setLogoPreview(resolveCompanyLogoUrl(data.logoUrl));
        }
      })
      .catch(() => setError('Unable to load company information.'));
  }, []);

  React.useEffect(() => {
    if (!logoFile) return undefined;
    const previewUrl = URL.createObjectURL(logoFile);
    setLogoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [logoFile]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const canPersist = form.id ? hasPermission(PERMISSIONS.COMPANY_UPDATE) : hasPermission(PERMISSIONS.COMPANY_CREATE);
  const canUploadLogo = Boolean(form.id) && hasPermission(PERMISSIONS.COMPANY_UPDATE);

  const validateForm = () => {
    if (!form.companyName.trim()) return 'Company name is required.';
    if (!form.companyCode.trim()) return 'Company code is required.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.';
    if (form.phoneNumber && !/^[0-9]+$/.test(form.phoneNumber)) return 'Phone number should contain numbers only.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canPersist) return;
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        companyName: form.companyName,
        companyCode: form.companyCode,
        email: form.email || null,
        phoneNumber: form.phoneNumber || null,
        address: form.address || null,
        status: form.status || 'ACTIVE',
      };
      let saved = form.id ? await updateCompany(form.id, payload) : await createCompany(payload);
      if (logoFile && hasPermission(PERMISSIONS.COMPANY_UPDATE)) {
        saved = await uploadCompanyLogo(saved.id, logoFile);
        setLogoFile(null);
      }
      setForm({ ...initialForm, ...saved, status: saved.status || 'ACTIVE' });
      setLogoPreview(resolveCompanyLogoUrl(saved.logoUrl));
      setSuccess('Company information saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save company information.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>Company Master</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Maintain company information used in the top navigation bar.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      <CommonFormCard component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><CommonInput required disabled={!canPersist} label="Company Code" value={form.companyCode || ''} onChange={updateField('companyCode')} /></Grid>
          <Grid item xs={12} md={8}><CommonInput required disabled={!canPersist} label="Company Name" value={form.companyName || ''} onChange={updateField('companyName')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput type="email" disabled={!canPersist} label="Email" value={form.email || ''} onChange={updateField('email')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput disabled={!canPersist} label="Phone Number" value={form.phoneNumber || ''} onChange={updateField('phoneNumber')} /></Grid>
          <Grid item xs={12} md={4}>
            <CommonDropdown disabled={!canPersist} label="Status" value={form.status || 'ACTIVE'} onChange={updateField('status')} options={STATUS_OPTIONS} />
          </Grid>
          <Grid item xs={12}><CommonTextArea disabled={!canPersist} label="Address" value={form.address || ''} onChange={updateField('address')} /></Grid>
          <Grid item xs={12} md={5}>
            <Stack spacing={1.5}>
              {canUploadLogo && (
                <CommonFileUpload
                  label="Upload Logo"
                  accept="image/*"
                  onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
                />
              )}
              {logoPreview && (
                <Box
                  sx={{
                    width: 180,
                    height: 96,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',
                    bgcolor: 'background.default',
                  }}
                >
                  <Box component="img" src={logoPreview} alt="Company logo preview" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
        <CommonFormActions saving={saving} showSave={canPersist} saveLabel="Save Company" />
      </CommonFormCard>
    </Box>
  );
}

export default CompanyFormPage;

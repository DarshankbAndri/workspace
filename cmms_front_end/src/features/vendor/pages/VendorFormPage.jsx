import React from 'react';
import { Alert, Box, Checkbox, FormControlLabel, Grid, IconButton, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { createVendor, getVendorById, updateVendor } from '../services/vendorService';
import { getSites } from '../../site/services/siteService';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonTextArea from '../../../shared/components/common/CommonTextArea';
import CommonDropdown from '../../../shared/components/common/CommonDropdown';
import CommonFormActions from '../../../shared/components/common/CommonFormActions';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';
import { Button } from '@mui/material';
import { getDropdownOptions } from '../../../shared/utils/dropdownHelper';

const STATUS_OPTIONS = getDropdownOptions('COMMON', 'activeStatus');

const emptyAssignment = {
  siteId: '',
  primarySite: false,
  status: 'ACTIVE',
};

const initialForm = {
  vendorCode: '',
  vendorName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  serviceCategory: '',
  active: true,
  siteAssignments: [{ ...emptyAssignment, primarySite: true }],
};

function VendorFormPage() {
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
      getVendorById(id).then((data) => setForm({ ...initialForm, ...data, siteAssignments: normalizeAssignments(data.siteAssignments) })).catch(() => setError('Unable to load vendor.'));
    }
  }, [id, isEdit]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateActive = (event) => setForm((current) => ({ ...current, active: event.target.checked }));
  const updateAssignment = (index, field, value) => {
    setForm((current) => ({
      ...current,
      siteAssignments: current.siteAssignments.map((assignment, assignmentIndex) => (
        assignmentIndex === index ? { ...assignment, [field]: value } : assignment
      )),
    }));
  };
  const setPrimaryAssignment = (index) => {
    setForm((current) => ({
      ...current,
      siteAssignments: current.siteAssignments.map((assignment, assignmentIndex) => ({ ...assignment, primarySite: assignmentIndex === index })),
    }));
  };
  const addAssignment = () => setForm((current) => ({ ...current, siteAssignments: [...current.siteAssignments, { ...emptyAssignment }] }));
  const removeAssignment = (index) => {
    setForm((current) => {
      const next = current.siteAssignments.filter((_, assignmentIndex) => assignmentIndex !== index);
      return { ...current, siteAssignments: next.length ? next : [{ ...emptyAssignment }] };
    });
  };

  const validateForm = () => {
    if (!form.siteAssignments.length) return 'At least one site assignment is required.';
    const primaryCount = form.siteAssignments.filter((assignment) => assignment.primarySite).length;
    if (primaryCount > 1) return 'Only one primary site is allowed.';
    const activeSites = new Set();
    for (const assignment of form.siteAssignments) {
      if (!assignment.siteId) return 'Site is required for every assignment.';
      if (assignment.status === 'ACTIVE') {
        if (activeSites.has(String(assignment.siteId))) return 'Duplicate active site assignment is not allowed.';
        activeSites.add(String(assignment.siteId));
      }
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        siteAssignments: form.siteAssignments.map((assignment) => ({ ...assignment, siteId: Number(assignment.siteId) })),
      };
      if (isEdit) {
        await updateVendor(id, payload);
      } else {
        await createVendor(payload);
      }
      navigate('/vendors');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save vendor.');
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
      <Typography variant="h4" fontWeight={800} gutterBottom>{isEdit ? 'Edit Vendor' : 'Add Vendor'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
      <CommonFormCard title="Vendor Basic Details" sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><CommonInput required label="Vendor Code" value={form.vendorCode} onChange={updateField('vendorCode')} /></Grid>
          <Grid item xs={12} md={8}><CommonInput required label="Vendor Name" value={form.vendorName} onChange={updateField('vendorName')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput label="Contact Person" value={form.contactPerson || ''} onChange={updateField('contactPerson')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput type="email" label="Email" value={form.email || ''} onChange={updateField('email')} /></Grid>
          <Grid item xs={12} md={4}><CommonInput label="Phone" value={form.phone || ''} onChange={updateField('phone')} /></Grid>
          <Grid item xs={12} md={6}><CommonInput label="Service Category" value={form.serviceCategory || ''} onChange={updateField('serviceCategory')} /></Grid>
          <Grid item xs={12} md={6}><FormControlLabel control={<Switch checked={Boolean(form.active)} onChange={updateActive} />} label="Active vendor" /></Grid>
          <Grid item xs={12}><CommonTextArea label="Address" value={form.address || ''} onChange={updateField('address')} /></Grid>
        </Grid>
      </CommonFormCard>
      <CommonFormCard>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>Site Assignment</Typography>
            <Typography variant="body2" color="text.secondary">Assign this vendor to one or more active sites.</Typography>
          </Box>
          <Button variant="outlined" startIcon={<Add />} onClick={addAssignment}>Add Site Row</Button>
        </Stack>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 240 }}>Site</TableCell>
                <TableCell align="center">Primary</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {form.siteAssignments.map((assignment, index) => (
                <TableRow key={`${assignment.assignmentId || 'new'}-${index}`}>
                  <TableCell>
                    <CommonDropdown
                      size="small"
                      value={assignment.siteId || ''}
                      onChange={(event) => updateAssignment(index, 'siteId', event.target.value)}
                      options={siteOptions}
                    />
                  </TableCell>
                  <TableCell align="center"><Checkbox checked={Boolean(assignment.primarySite)} onChange={() => setPrimaryAssignment(index)} /></TableCell>
                  <TableCell>
                    <CommonDropdown
                      size="small"
                      value={assignment.status || 'ACTIVE'}
                      onChange={(event) => updateAssignment(index, 'status', event.target.value)}
                      options={STATUS_OPTIONS}
                    />
                  </TableCell>
                  <TableCell align="right"><IconButton aria-label="Remove site assignment" color="error" onClick={() => removeAssignment(index)}><Delete fontSize="small" /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <CommonFormActions saving={saving} onCancel={() => navigate('/vendors')} />
      </CommonFormCard>
      </Box>
    </Box>
  );
}

function normalizeAssignments(assignments = []) {
  if (!assignments.length) {
    return [{ ...emptyAssignment }];
  }
  return assignments.map((assignment) => ({
    ...emptyAssignment,
    ...assignment,
    siteId: assignment.siteId || '',
    primarySite: Boolean(assignment.primarySite),
    status: assignment.status || 'ACTIVE',
  }));
}

export default VendorFormPage;

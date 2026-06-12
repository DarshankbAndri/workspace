import React from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Save } from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createEmployee, getEmployeeById, updateEmployee } from '../../../services/employeeService';
import { getSites } from '../../../services/siteService';

const emptyAssignment = {
  siteId: '',
  roleName: '',
  primarySite: false,
  effectiveFrom: '',
  effectiveTo: '',
  status: 'ACTIVE',
};

const initialForm = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  mobileNumber: '',
  email: '',
  gender: '',
  dateOfBirth: '',
  dateOfJoining: '',
  designation: '',
  department: '',
  status: 'ACTIVE',
  siteAssignments: [{ ...emptyAssignment, primarySite: true }],
};

function EmployeeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const viewOnly = Boolean(location.state?.viewOnly);
  const [form, setForm] = React.useState(initialForm);
  const [sites, setSites] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState('');

  React.useEffect(() => {
    getSites().then((data) => setSites(data.filter((site) => site.status !== 'INACTIVE'))).catch(() => setError('Unable to load sites.'));
  }, []);

  React.useEffect(() => {
    if (isEdit) {
      getEmployeeById(id)
        .then((data) => setForm({ ...initialForm, ...data, siteAssignments: normalizeAssignments(data.siteAssignments) }))
        .catch(() => setError('Unable to load employee.'));
    }
  }, [id, isEdit]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const updateAssignment = (index, field, value) => {
    setForm((current) => ({
      ...current,
      siteAssignments: current.siteAssignments.map((assignment, assignmentIndex) => {
        if (assignmentIndex !== index) return assignment;
        return { ...assignment, [field]: value };
      }),
    }));
  };

  const setPrimaryAssignment = (index) => {
    setForm((current) => ({
      ...current,
      siteAssignments: current.siteAssignments.map((assignment, assignmentIndex) => ({
        ...assignment,
        primarySite: assignmentIndex === index,
      })),
    }));
  };

  const addAssignment = () => {
    setForm((current) => ({ ...current, siteAssignments: [...current.siteAssignments, { ...emptyAssignment }] }));
  };

  const removeAssignment = (index) => {
    setForm((current) => {
      const next = current.siteAssignments.filter((_, assignmentIndex) => assignmentIndex !== index);
      return { ...current, siteAssignments: next.length ? next : [{ ...emptyAssignment }] };
    });
  };

  const validateForm = () => {
    if (!form.employeeCode.trim()) return 'Employee code is required.';
    if (!form.mobileNumber.trim()) return 'Mobile number is required.';
    if (!form.siteAssignments.length) return 'At least one site assignment is required.';
    const primaryCount = form.siteAssignments.filter((assignment) => assignment.primarySite).length;
    if (primaryCount > 1) return 'Only one primary site is allowed.';
    const activeKeys = new Set();
    for (const assignment of form.siteAssignments) {
      if (!assignment.siteId) return 'Site is required for every assignment.';
      if (!assignment.roleName.trim()) return 'Role is required for every assignment.';
      if (assignment.effectiveFrom && assignment.effectiveTo && assignment.effectiveTo < assignment.effectiveFrom) {
        return 'Effective To Date should not be before Effective From Date.';
      }
      if (assignment.status === 'ACTIVE') {
        const key = `${assignment.siteId}|${assignment.roleName.trim().toLowerCase()}`;
        if (activeKeys.has(key)) return 'Duplicate active site-role assignment is not allowed.';
        activeKeys.add(key);
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
        dateOfBirth: form.dateOfBirth || null,
        dateOfJoining: form.dateOfJoining || null,
        siteAssignments: form.siteAssignments.map((assignment) => ({
          ...assignment,
          siteId: Number(assignment.siteId),
          effectiveFrom: assignment.effectiveFrom || null,
          effectiveTo: assignment.effectiveTo || null,
        })),
      };
      if (isEdit) {
        await updateEmployee(id, payload);
      } else {
        await createEmployee(payload);
      }
      setSnackbar('Employee saved.');
      navigate('/hr/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save employee.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>{viewOnly ? 'View Employee' : isEdit ? 'Edit Employee' : 'Add Employee'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, borderRadius: 1, mb: 2 }}>
          <Typography variant="h6" fontWeight={800} gutterBottom>Basic Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField required disabled={viewOnly} fullWidth label="Employee Code" value={form.employeeCode} onChange={updateField('employeeCode')} /></Grid>
            <Grid item xs={12} md={3}><TextField required disabled={viewOnly} fullWidth label="First Name" value={form.firstName} onChange={updateField('firstName')} /></Grid>
            <Grid item xs={12} md={3}><TextField disabled={viewOnly} fullWidth label="Last Name" value={form.lastName || ''} onChange={updateField('lastName')} /></Grid>
            <Grid item xs={12} md={3}><TextField required disabled={viewOnly} fullWidth label="Mobile Number" value={form.mobileNumber} onChange={updateField('mobileNumber')} /></Grid>
            <Grid item xs={12} md={4}><TextField type="email" disabled={viewOnly} fullWidth label="Email" value={form.email || ''} onChange={updateField('email')} /></Grid>
            <Grid item xs={12} md={2}><TextField select disabled={viewOnly} fullWidth label="Gender" value={form.gender || ''} onChange={updateField('gender')}><MenuItem value="">Not set</MenuItem><MenuItem value="MALE">MALE</MenuItem><MenuItem value="FEMALE">FEMALE</MenuItem><MenuItem value="OTHER">OTHER</MenuItem></TextField></Grid>
            <Grid item xs={12} md={3}><TextField type="date" disabled={viewOnly} fullWidth label="Date of Birth" value={form.dateOfBirth || ''} onChange={updateField('dateOfBirth')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={3}><TextField type="date" disabled={viewOnly} fullWidth label="Date of Joining" value={form.dateOfJoining || ''} onChange={updateField('dateOfJoining')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={4}><TextField disabled={viewOnly} fullWidth label="Designation" value={form.designation || ''} onChange={updateField('designation')} /></Grid>
            <Grid item xs={12} md={4}><TextField disabled={viewOnly} fullWidth label="Department" value={form.department || ''} onChange={updateField('department')} /></Grid>
            <Grid item xs={12} md={4}><TextField select disabled={viewOnly} fullWidth label="Status" value={form.status || 'ACTIVE'} onChange={updateField('status')}><MenuItem value="ACTIVE">ACTIVE</MenuItem><MenuItem value="INACTIVE">INACTIVE</MenuItem></TextField></Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>Site Execution Details</Typography>
              <Typography variant="body2" color="text.secondary">Assign this employee to one or more sites with site-specific roles.</Typography>
            </Box>
            {!viewOnly && <Button variant="outlined" startIcon={<Add />} onClick={addAssignment}>Add Row</Button>}
          </Stack>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 220 }}>Site</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>Role</TableCell>
                  <TableCell align="center">Primary</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>Effective From</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>Effective To</TableCell>
                  <TableCell sx={{ minWidth: 140 }}>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {form.siteAssignments.map((assignment, index) => (
                  <TableRow key={`${assignment.assignmentId || 'new'}-${index}`}>
                    <TableCell><TextField select disabled={viewOnly} fullWidth size="small" value={assignment.siteId || ''} onChange={(event) => updateAssignment(index, 'siteId', event.target.value)}>{sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.siteName}</MenuItem>)}</TextField></TableCell>
                    <TableCell><TextField disabled={viewOnly} fullWidth size="small" value={assignment.roleName || ''} onChange={(event) => updateAssignment(index, 'roleName', event.target.value)} /></TableCell>
                    <TableCell align="center"><Checkbox disabled={viewOnly} checked={Boolean(assignment.primarySite)} onChange={() => setPrimaryAssignment(index)} /></TableCell>
                    <TableCell><TextField type="date" disabled={viewOnly} fullWidth size="small" value={assignment.effectiveFrom || ''} onChange={(event) => updateAssignment(index, 'effectiveFrom', event.target.value)} /></TableCell>
                    <TableCell><TextField type="date" disabled={viewOnly} fullWidth size="small" value={assignment.effectiveTo || ''} onChange={(event) => updateAssignment(index, 'effectiveTo', event.target.value)} /></TableCell>
                    <TableCell><TextField select disabled={viewOnly} fullWidth size="small" value={assignment.status || 'ACTIVE'} onChange={(event) => updateAssignment(index, 'status', event.target.value)}><MenuItem value="ACTIVE">ACTIVE</MenuItem><MenuItem value="INACTIVE">INACTIVE</MenuItem></TextField></TableCell>
                    <TableCell align="right">{!viewOnly && <IconButton aria-label="Remove assignment" color="error" onClick={() => removeAssignment(index)}><Delete fontSize="small" /></IconButton>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            {!viewOnly && <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>}
            <Button variant="outlined" onClick={() => navigate('/hr/employees')}>{viewOnly ? 'Back' : 'Cancel'}</Button>
          </Stack>
        </Paper>
      </Box>
      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} message={snackbar} onClose={() => setSnackbar('')} />
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
    effectiveFrom: assignment.effectiveFrom || '',
    effectiveTo: assignment.effectiveTo || '',
    primarySite: Boolean(assignment.primarySite),
    status: assignment.status || 'ACTIVE',
  }));
}

export default EmployeeFormPage;

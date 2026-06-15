import React from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { createRole, getRoleById, updateRole } from '../../../services/roleService';
import { getGroupedPermissions } from '../../../services/permissionService';

const initialForm = {
  roleCode: '',
  roleName: '',
  description: '',
  status: 'ACTIVE',
  permissionIds: [],
};

function RoleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = React.useState(initialForm);
  const [permissionGroups, setPermissionGroups] = React.useState({});
  const [permissionSearch, setPermissionSearch] = React.useState('');
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    getGroupedPermissions()
      .then((data) => setPermissionGroups(data || {}))
      .catch(() => setError('Unable to load permissions.'));
  }, []);

  React.useEffect(() => {
    if (!isEdit) return;
    getRoleById(id)
      .then((data) => setForm({
        roleCode: data.roleCode || '',
        roleName: data.roleName || '',
        description: data.description || '',
        status: data.status || 'ACTIVE',
        permissionIds: data.permissionIds || (data.permissions || []).map((permission) => permission.id),
      }))
      .catch(() => setError('Unable to load role.'));
  }, [id, isEdit]);

  const allPermissions = React.useMemo(() => Object.values(permissionGroups).flat(), [permissionGroups]);
  const selectedPermissionIds = React.useMemo(() => new Set(form.permissionIds), [form.permissionIds]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const togglePermission = (permissionId) => {
    setForm((current) => {
      const selected = new Set(current.permissionIds);
      selected.has(permissionId) ? selected.delete(permissionId) : selected.add(permissionId);
      return { ...current, permissionIds: Array.from(selected) };
    });
  };

  const selectPermissions = (permissionIds) => {
    setForm((current) => ({ ...current, permissionIds: Array.from(new Set([...current.permissionIds, ...permissionIds])) }));
  };

  const clearPermissions = (permissionIds) => {
    const clearSet = new Set(permissionIds);
    setForm((current) => ({ ...current, permissionIds: current.permissionIds.filter((permissionId) => !clearSet.has(permissionId)) }));
  };

  const validate = () => {
    if (!form.roleCode.trim()) return 'Role Code is required.';
    if (!form.roleName.trim()) return 'Role Name is required.';
    if (!form.status) return 'Status is required.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        roleCode: form.roleCode.trim().toUpperCase(),
        roleName: form.roleName.trim(),
      };
      if (isEdit) {
        await updateRole(id, payload);
      } else {
        await createRole(payload);
      }
      navigate('/admin/roles');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save role.');
    } finally {
      setSaving(false);
    }
  };

  const matchesSearch = (permission) => {
    const query = permissionSearch.trim().toLowerCase();
    if (!query) return true;
    return `${permission.permissionCode || ''} ${permission.permissionName || ''}`.toLowerCase().includes(query);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>{isEdit ? 'Edit Role' : 'Add Role'}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, borderRadius: 1, mb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Role Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField required fullWidth label="Role Code" value={form.roleCode} onChange={updateField('roleCode')} /></Grid>
            <Grid item xs={12} md={3}><TextField required fullWidth label="Role Name" value={form.roleName} onChange={updateField('roleName')} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Description" value={form.description || ''} onChange={updateField('description')} /></Grid>
            <Grid item xs={12} md={2}>
              <TextField select required fullWidth label="Status" value={form.status} onChange={updateField('status')}>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>Permission Assignment</Typography>
              <Typography variant="body2" color="text.secondary">{form.permissionIds.length} permissions selected</Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField size="small" label="Search permissions" value={permissionSearch} onChange={(event) => setPermissionSearch(event.target.value)} />
              <Button variant="outlined" onClick={() => selectPermissions(allPermissions.map((permission) => permission.id))}>Select All</Button>
              <Button variant="outlined" color="inherit" onClick={() => setForm((current) => ({ ...current, permissionIds: [] }))}>Clear All</Button>
            </Stack>
          </Stack>

          <Stack spacing={2}>
            {Object.entries(permissionGroups).map(([moduleName, permissions]) => {
              const visiblePermissions = permissions.filter(matchesSearch);
              if (!visiblePermissions.length) return null;
              const visibleIds = visiblePermissions.map((permission) => permission.id);
              return (
                <Paper key={moduleName} variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1} sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight={800}>{moduleName}</Typography>
                      <Chip size="small" label={`${visiblePermissions.filter((permission) => selectedPermissionIds.has(permission.id)).length}/${visiblePermissions.length}`} />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => selectPermissions(visibleIds)}>Select All</Button>
                      <Button size="small" color="inherit" onClick={() => clearPermissions(visibleIds)}>Clear All</Button>
                    </Stack>
                  </Stack>
                  <Divider sx={{ mb: 1 }} />
                  <Grid container spacing={1}>
                    {visiblePermissions.map((permission) => (
                      <Grid item xs={12} sm={6} md={4} key={permission.permissionCode}>
                        <FormControlLabel
                          control={<Checkbox checked={selectedPermissionIds.has(permission.id)} onChange={() => togglePermission(permission.id)} />}
                          label={`${permission.permissionCode} - ${permission.permissionName}`}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              );
            })}
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            <Button variant="outlined" onClick={() => navigate('/admin/roles')}>Cancel</Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default RoleFormPage;

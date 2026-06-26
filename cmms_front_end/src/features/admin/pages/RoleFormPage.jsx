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
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Typography,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { createRole, getRoleById, updateRole } from '../services/roleService';
import { getGroupedPermissions } from '../services/permissionService';

const initialForm = {
  roleCode: '',
  roleName: '',
  description: '',
  status: 'ACTIVE',
  permissionIds: [],
};

const permissionCategories = [
  { key: 'operation', label: 'Operation' },
  { key: 'hr', label: 'HR' },
  { key: 'admin', label: 'Admin' },
];

const categoryGroupOrder = {
  operation: ['Dashboard', 'Masters', 'Maintenance', 'Reports'],
  hr: ['Creation'],
  admin: ['Access Control'],
};

const subGroupOrder = {
  Dashboard: ['Dashboard'],
  Masters: ['Equipment', 'Vendors'],
  Maintenance: ['Requests', 'Assignments', 'Downtime'],
  Reports: ['Reports'],
  Creation: ['Sites', 'Employees'],
  'Access Control': ['Roles', 'Permissions', 'User Role'],
};

const permissionCodeOrder = [
  'DASHBOARD_VIEW',
  'EQUIPMENT_VIEW',
  'EQUIPMENT_CREATE',
  'EQUIPMENT_UPDATE',
  'EQUIPMENT_DELETE',
  'VENDOR_VIEW',
  'VENDOR_CREATE',
  'VENDOR_UPDATE',
  'VENDOR_DELETE',
  'REQUEST_VIEW',
  'REQUEST_CREATE',
  'REQUEST_UPDATE',
  'REQUEST_DELETE',
  'ASSIGNMENT_VIEW',
  'ASSIGNMENT_CREATE',
  'ASSIGNMENT_UPDATE',
  'ASSIGNMENT_DELETE',
  'DOWNTIME_VIEW',
  'DOWNTIME_CREATE',
  'DOWNTIME_UPDATE',
  'DOWNTIME_DELETE',
  'REPORT_VIEW',
  'SITE_VIEW',
  'SITE_CREATE',
  'SITE_UPDATE',
  'SITE_DELETE',
  'EMPLOYEE_VIEW',
  'EMPLOYEE_CREATE',
  'EMPLOYEE_UPDATE',
  'EMPLOYEE_DELETE',
  'ROLE_VIEW',
  'ROLE_CREATE',
  'ROLE_UPDATE',
  'ROLE_DELETE',
  'PERMISSION_VIEW',
  'USER_ROLE_ASSIGN',
];

function getPermissionCategory(permission) {
  const code = permission.permissionCode || '';
  const moduleName = (permission.moduleName || '').toLowerCase();
  if (
    moduleName.includes('site') ||
    moduleName.includes('employee') ||
    code.startsWith('SITE_') ||
    code.startsWith('EMPLOYEE_')
  ) {
    return 'hr';
  }
  if (
    moduleName.includes('admin') ||
    moduleName.includes('role') ||
    moduleName.includes('permission') ||
    code.startsWith('ROLE_') ||
    code === 'PERMISSION_VIEW' ||
    code === 'USER_ROLE_ASSIGN' ||
    code.startsWith('USER_ROLE_')
  ) {
    return 'admin';
  }
  return 'operation';
}

function getPermissionGroupLabel(permission, category) {
  const code = permission.permissionCode || '';
  if (category === 'operation') {
    if (code === 'DASHBOARD_VIEW') return 'Dashboard';
    if (code.startsWith('EQUIPMENT_') || code.startsWith('VENDOR_')) return 'Masters';
    if (code.startsWith('REQUEST_') || code.startsWith('ASSIGNMENT_') || code.startsWith('DOWNTIME_')) return 'Maintenance';
    if (code === 'REPORT_VIEW') return 'Reports';
  }
  if (category === 'hr') {
    return 'Creation';
  }
  if (category === 'admin') {
    return 'Access Control';
  }
  return permission.moduleName || 'General';
}

function getPermissionSubGroupLabel(permission, category) {
  const code = permission.permissionCode || '';
  if (category === 'operation') {
    if (code === 'DASHBOARD_VIEW') return 'Dashboard';
    if (code.startsWith('EQUIPMENT_')) return 'Equipment';
    if (code.startsWith('VENDOR_')) return 'Vendors';
    if (code.startsWith('REQUEST_')) return 'Requests';
    if (code.startsWith('ASSIGNMENT_')) return 'Assignments';
    if (code.startsWith('DOWNTIME_')) return 'Downtime';
    if (code === 'REPORT_VIEW') return 'Reports';
  }
  if (category === 'hr') {
    if (code.startsWith('SITE_')) return 'Sites';
    if (code.startsWith('EMPLOYEE_')) return 'Employees';
  }
  if (category === 'admin') {
    if (code.startsWith('ROLE_')) return 'Roles';
    if (code === 'PERMISSION_VIEW') return 'Permissions';
    if (code === 'USER_ROLE_ASSIGN' || code.startsWith('USER_ROLE_')) return 'User Role';
  }
  return permission.moduleName || 'General';
}

function groupPermissionsBySubGroup(permissions, category, groupLabel) {
  const grouped = permissions.reduce((groups, permission) => {
    const subGroupLabel = getPermissionSubGroupLabel(permission, category);
    groups[subGroupLabel] = groups[subGroupLabel] || [];
    groups[subGroupLabel].push(permission);
    return groups;
  }, {});
  const ordered = {};
  for (const subGroupLabel of subGroupOrder[groupLabel] || Object.keys(grouped)) {
    if (grouped[subGroupLabel]?.length) {
      ordered[subGroupLabel] = sortPermissions(grouped[subGroupLabel]);
    }
  }
  return ordered;
}

function sortPermissions(permissions) {
  return [...permissions].sort((a, b) => {
    const aIndex = permissionCodeOrder.indexOf(a.permissionCode);
    const bIndex = permissionCodeOrder.indexOf(b.permissionCode);
    const normalizedA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const normalizedB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    if (normalizedA !== normalizedB) return normalizedA - normalizedB;
    return (a.permissionCode || '').localeCompare(b.permissionCode || '');
  });
}

function RoleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = React.useState(initialForm);
  const [permissionGroups, setPermissionGroups] = React.useState({});
  const [permissionSearch, setPermissionSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('operation');
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

  const categoryPermissionGroups = React.useMemo(() => {
    const grouped = Object.values(permissionGroups).flat().reduce((groups, permission) => {
      if (getPermissionCategory(permission) !== selectedCategory) {
        return groups;
      }
      const groupLabel = getPermissionGroupLabel(permission, selectedCategory);
      groups[groupLabel] = groups[groupLabel] || [];
      groups[groupLabel].push(permission);
      return groups;
    }, {});
    const ordered = {};
    for (const groupLabel of categoryGroupOrder[selectedCategory] || Object.keys(grouped)) {
      if (grouped[groupLabel]?.length) {
        ordered[groupLabel] = sortPermissions(grouped[groupLabel]);
      }
    }
    return ordered;
  }, [permissionGroups, selectedCategory]);
  const categoryPermissions = React.useMemo(() => Object.values(categoryPermissionGroups).flat(), [categoryPermissionGroups]);
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
              <Button variant="outlined" onClick={() => selectPermissions(categoryPermissions.map((permission) => permission.id))}>Select All</Button>
              <Button variant="outlined" color="inherit" onClick={() => clearPermissions(categoryPermissions.map((permission) => permission.id))}>Clear All</Button>
            </Stack>
          </Stack>

          <ToggleButtonGroup
            exclusive
            value={selectedCategory}
            onChange={(_, value) => value && setSelectedCategory(value)}
            size="small"
            sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
          >
            {permissionCategories.map((category) => (
              <ToggleButton
                key={category.key}
                value={category.key}
                sx={{
                  borderRadius: 1,
                  px: 2,
                  fontWeight: 800,
                  '&.Mui-selected': {
                    color: 'primary.main',
                    bgcolor: 'action.selected',
                  },
                }}
              >
                {category.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Stack spacing={2}>
            {Object.entries(categoryPermissionGroups).map(([moduleName, permissions]) => {
              const visiblePermissions = permissions.filter(matchesSearch);
              if (!visiblePermissions.length) return null;
              const visibleIds = visiblePermissions.map((permission) => permission.id);
              const visibleSubGroups = groupPermissionsBySubGroup(visiblePermissions, selectedCategory, moduleName);
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
                  <Stack spacing={1.5}>
                    {Object.entries(visibleSubGroups).map(([subGroupLabel, subGroupPermissions]) => (
                      <Box key={subGroupLabel}>
                        <Typography variant="body2" fontWeight={800} color="text.secondary" sx={{ mb: 0.5 }}>
                          {subGroupLabel}
                        </Typography>
                        <Grid container spacing={1}>
                          {subGroupPermissions.map((permission) => (
                            <Grid item xs={12} sm={6} md={4} key={permission.permissionCode}>
                              <FormControlLabel
                                control={<Checkbox checked={selectedPermissionIds.has(permission.id)} onChange={() => togglePermission(permission.id)} />}
                                label={`${permission.permissionCode} - ${permission.permissionName}`}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ))}
                  </Stack>
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

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Refresh, Save } from '@mui/icons-material';
import { getRoles } from '../../../services/roleService';
import { getNotificationSettings, updateNotificationSettings } from '../../../services/notificationSettingsService';

const initialForm = {
  enabled: true,
  inAppEnabled: true,
  emailEnabled: false,
  pmDueReminderEnabled: true,
  overdueRequestEnabled: true,
  approvalPendingEnabled: true,
  pmReminderDays: 3,
  scanTime: '07:00',
  pmRecipientRoleCodes: [],
  overdueRecipientRoleCodes: [],
  approvalFallbackRoleCodes: [],
};

function RoleSelect({ label, value, roles, onChange }) {
  return (
    <TextField
      select
      fullWidth
      label={label}
      value={value || []}
      onChange={onChange}
      SelectProps={{
        multiple: true,
        renderValue: (selected) => (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {selected.map((code) => <Chip key={code} size="small" label={code} />)}
          </Stack>
        ),
      }}
    >
      {roles.map((role) => (
        <MenuItem key={role.id} value={role.roleCode}>
          <Checkbox checked={(value || []).includes(role.roleCode)} />
          {role.roleName} ({role.roleCode})
        </MenuItem>
      ))}
    </TextField>
  );
}

function NotificationSettingsPage() {
  const [form, setForm] = React.useState(initialForm);
  const [roles, setRoles] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const loadData = React.useCallback(() => {
    setLoading(true);
    Promise.all([getNotificationSettings(), getRoles()])
      .then(([settings, roleRows]) => {
        setForm({ ...initialForm, ...settings });
        setRoles((roleRows || []).filter((role) => role.status !== 'INACTIVE'));
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load notification settings.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const updateSwitch = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.checked }));
  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateRoles = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: typeof value === 'string' ? value.split(',') : value }));
  };

  const hasEmptyRecipients = form.pmDueReminderEnabled && (form.pmRecipientRoleCodes || []).length === 0
    || form.overdueRequestEnabled && (form.overdueRecipientRoleCodes || []).length === 0
    || form.approvalPendingEnabled && (form.approvalFallbackRoleCodes || []).length === 0;

  const saveSettings = async () => {
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        pmReminderDays: Number(form.pmReminderDays),
      };
      const saved = await updateNotificationSettings(payload);
      setForm({ ...initialForm, ...saved });
      setSuccess('Notification settings updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update notification settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800}>Notification Settings</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadData} disabled={loading}>Refresh</Button>
          <Button variant="contained" startIcon={<Save />} onClick={saveSettings} disabled={saving || loading}>{saving ? 'Saving...' : 'Save'}</Button>
        </Stack>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {hasEmptyRecipients && <Alert severity="warning" sx={{ mb: 2 }}>One or more enabled notification types has no recipient roles.</Alert>}
      <Paper sx={{ p: 3, borderRadius: 1 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <FormControlLabel control={<Switch checked={Boolean(form.enabled)} onChange={updateSwitch('enabled')} />} label="Notifications Enabled" />
              <FormControlLabel control={<Switch checked={Boolean(form.inAppEnabled)} onChange={updateSwitch('inAppEnabled')} />} label="In-App Notifications" />
              <FormControlLabel control={<Switch checked={Boolean(form.emailEnabled)} onChange={updateSwitch('emailEnabled')} />} label="Email Notifications" />
              <FormControlLabel control={<Switch checked={Boolean(form.pmDueReminderEnabled)} onChange={updateSwitch('pmDueReminderEnabled')} />} label="PM Due Reminders" />
              <FormControlLabel control={<Switch checked={Boolean(form.overdueRequestEnabled)} onChange={updateSwitch('overdueRequestEnabled')} />} label="Overdue Request Alerts" />
              <FormControlLabel control={<Switch checked={Boolean(form.approvalPendingEnabled)} onChange={updateSwitch('approvalPendingEnabled')} />} label="Approval Pending Alerts" />
            </Stack>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="PM Reminder Days"
              value={form.pmReminderDays}
              onChange={updateField('pmReminderDays')}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="time"
              label="Daily Scan Time"
              value={form.scanTime || '07:00'}
              onChange={updateField('scanTime')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <RoleSelect label="PM Recipient Roles" value={form.pmRecipientRoleCodes} roles={roles} onChange={updateRoles('pmRecipientRoleCodes')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <RoleSelect label="Overdue Recipient Roles" value={form.overdueRecipientRoleCodes} roles={roles} onChange={updateRoles('overdueRecipientRoleCodes')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <RoleSelect label="Approval Fallback Roles" value={form.approvalFallbackRoleCodes} roles={roles} onChange={updateRoles('approvalFallbackRoleCodes')} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Last updated: {form.updatedAt ? new Date(form.updatedAt).toLocaleString() : '-'} {form.updatedByName ? `by ${form.updatedByName}` : ''}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} message={success} onClose={() => setSuccess('')} />
    </Box>
  );
}

export default NotificationSettingsPage;

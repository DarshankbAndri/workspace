import React from 'react';
import { Alert, Avatar, Box, Button, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { CameraAlt, LockReset } from '@mui/icons-material';
import { changePassword } from '../../../shared/services/api';
import { useAuth } from '../../../shared/context/AuthContext';
import CommonFormCard from '../../../shared/components/common/CommonFormCard';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonDialog from '../../../shared/components/common/CommonDialog';
import { getUserProfile, resolveProfilePhotoUrl, uploadProfileAvatar } from '../services/userProfileService';

const initialPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function UserProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = React.useState(null);
  const [passwordForm, setPasswordForm] = React.useState(initialPasswordForm);
  const [loading, setLoading] = React.useState(true);
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const loadProfile = React.useCallback(() => {
    setLoading(true);
    setError('');
    getUserProfile()
      .then((data) => {
        setProfile(data || null);
        if (data?.profilePhotoUrl) {
          updateUser({ profilePhotoUrl: data.profilePhotoUrl });
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load profile.'))
      .finally(() => setLoading(false));
  }, [updateUser]);

  React.useEffect(() => { loadProfile(); }, [loadProfile]);

  const initials = `${profile?.firstName?.[0] || user?.firstName?.[0] || ''}${profile?.lastName?.[0] || user?.lastName?.[0] || ''}` || profile?.username?.[0] || user?.username?.[0] || 'U';
  const avatarUrl = resolveProfilePhotoUrl(profile?.profilePhotoUrl || user?.profilePhotoUrl);

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setSuccess('');
    setAvatarUploading(true);
    try {
      const updated = await uploadProfileAvatar(file);
      setProfile(updated);
      updateUser({ profilePhotoUrl: updated.profilePhotoUrl });
      setSuccess('Profile picture updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to upload profile picture.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const updatePasswordField = (field) => (event) => {
    setPasswordForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const openPasswordDialog = () => {
    setPasswordForm(initialPasswordForm);
    setPasswordError('');
    setSuccess('');
    setPasswordDialogOpen(true);
  };

  const closePasswordDialog = () => {
    if (passwordSaving) return;
    setPasswordDialogOpen(false);
    setPasswordForm(initialPasswordForm);
    setPasswordError('');
  };

  const submitPasswordChange = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword, passwordForm.confirmPassword);
      setPasswordForm(initialPasswordForm);
      setPasswordDialogOpen(false);
      setSuccess('Password changed successfully.');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Unable to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>User Profile</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {loading ? (
        <Box sx={{ minHeight: 260, display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <CommonFormCard>
              <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
                <Avatar
                  src={avatarUrl}
                  sx={{ width: 132, height: 132, bgcolor: 'secondary.main', color: 'primary.main', fontSize: 42, fontWeight: 900 }}
                >
                  {initials.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={900}>{profile?.firstName} {profile?.lastName}</Typography>
                  <Typography variant="body2" color="text.secondary">{profile?.username}</Typography>
                </Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={avatarUploading ? <CircularProgress size={16} /> : <CameraAlt />}
                  disabled={avatarUploading}
                >
                  {avatarUploading ? 'Uploading...' : 'Change Picture'}
                  <input hidden type="file" accept="image/*" onChange={uploadAvatar} />
                </Button>
                <Button
                  variant="contained"
                  startIcon={<LockReset />}
                  onClick={openPasswordDialog}
                  fullWidth
                  sx={{ maxWidth: 220 }}
                >
                  Change Password
                </Button>
              </Stack>
            </CommonFormCard>
          </Grid>
          <Grid item xs={12} md={8}>
            <CommonFormCard title="Basic Details">
              <Grid container spacing={2}>
                <Detail label="Name" value={`${profile?.firstName || ''} ${profile?.lastName || ''}`} />
                <Detail label="Email" value={profile?.email} />
                <Detail label="Role" value={profile?.role} />
                <Detail label="Department" value={profile?.department} />
                <Detail label="Employee Code" value={profile?.employeeCode} />
                <Detail label="Designation" value={profile?.designation} />
                <Detail label="Mobile" value={profile?.mobileNumber} />
                <Detail label="Employee Status" value={profile?.employeeStatus} />
                <Detail label="Joining Date" value={profile?.dateOfJoining} />
                <Detail label="Gender" value={profile?.gender} />
              </Grid>
            </CommonFormCard>
          </Grid>
        </Grid>
      )}
      <CommonDialog
        open={passwordDialogOpen}
        title="Change Password"
        onClose={closePasswordDialog}
        maxWidth={false}
        fullWidth={false}
        actions={(
          <>
            <Button onClick={closePasswordDialog} disabled={passwordSaving}>Cancel</Button>
            <Button
              type="submit"
              form="change-password-form"
              variant="contained"
              startIcon={passwordSaving ? <CircularProgress color="inherit" size={16} /> : <LockReset />}
              disabled={passwordSaving}
            >
              {passwordSaving ? 'Changing...' : 'Change Password'}
            </Button>
          </>
        )}
      >
        <Box id="change-password-form" component="form" onSubmit={submitPasswordChange}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {passwordError && <Alert severity="error" onClose={() => setPasswordError('')}>{passwordError}</Alert>}
            <CommonInput required type="password" label="Current Password" value={passwordForm.currentPassword} onChange={updatePasswordField('currentPassword')} autoComplete="current-password" />
            <CommonInput required type="password" label="New Password" value={passwordForm.newPassword} onChange={updatePasswordField('newPassword')} autoComplete="new-password" />
            <CommonInput required type="password" label="Confirm Password" value={passwordForm.confirmPassword} onChange={updatePasswordField('confirmPassword')} autoComplete="new-password" />
          </Stack>
        </Box>
      </CommonDialog>
    </Box>
  );
}

function Detail({ label, value }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" fontWeight={700}>{value || '-'}</Typography>
    </Grid>
  );
}

export default UserProfilePage;

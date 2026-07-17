import React from 'react';
import { Button, CircularProgress, Stack } from '@mui/material';
import { Save } from '@mui/icons-material';

function CommonFormActions({ saving = false, onCancel, saveLabel, cancelLabel, showSave = true, children, sx }) {
  return (
    <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1.5} sx={{ mt: 3, ...sx }}>
      {onCancel && (
        <Button variant="outlined" onClick={onCancel} disabled={saving} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          {cancelLabel || 'Cancel'}
        </Button>
      )}
      {showSave && (
        <Button
          type="submit"
          variant="contained"
          startIcon={saving ? <CircularProgress color="inherit" size={16} /> : <Save />}
          disabled={saving}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
          data-testid="form-save-button"
        >
          {saving ? 'Saving...' : (saveLabel || 'Save')}
        </Button>
      )}
      {children}
    </Stack>
  );
}

export default CommonFormActions;

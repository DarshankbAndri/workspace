import React from 'react';
import { Button, Stack } from '@mui/material';
import { Save } from '@mui/icons-material';

function CommonFormActions({ saving = false, onCancel, saveLabel, cancelLabel, showSave = true, children, sx }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ mt: 3, ...sx }}>
      {showSave && (
        <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>
          {saving ? 'Saving...' : (saveLabel || 'Save')}
        </Button>
      )}
      {onCancel && (
        <Button variant="outlined" onClick={onCancel}>
          {cancelLabel || 'Cancel'}
        </Button>
      )}
      {children}
    </Stack>
  );
}

export default CommonFormActions;

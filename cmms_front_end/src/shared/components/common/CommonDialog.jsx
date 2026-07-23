import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

function CommonDialog({
  open,
  title,
  children,
  actions,
  onClose,
  maxWidth = 'sm',
  fullWidth = true,
  disableBackdropClose = false,
  contentSx,
}) {
  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (disableBackdropClose && reason === 'backdropClick') {
          return;
        }
        onClose?.();
      }}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          width: fullWidth ? undefined : 'min(520px, calc(100vw - 32px))',
          mx: 2,
        },
      }}
    >
      {title && (
        <DialogTitle sx={{ pr: onClose ? 6 : 3 }}>
          {title}
          {onClose && (
            <IconButton
              aria-label="Close"
              onClick={onClose}
              size="small"
              sx={{ position: 'absolute', right: 12, top: 12 }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent sx={contentSx}>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
}

export default CommonDialog;

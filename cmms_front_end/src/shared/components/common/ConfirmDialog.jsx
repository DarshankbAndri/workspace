import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function ConfirmDialog({
  open,
  handleClose,
  title,
  message,
  handleAgree,
  closebtn,
  agreebtn,
  isOuterClick = false,
}) {
  return (
    <Dialog
      open={open}
      fullWidth={false}
      maxWidth={false}
      onClose={() => {
        if (!isOuterClick) {
          handleClose();
        }
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          mx: 2,
          width: 'min(420px, calc(100vw - 32px))',
        },
      }}
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button data-testid="ConfirmDialogno" onClick={handleClose}>
          {closebtn}
        </Button>
        <Button data-testid="ConfirmDialogyes" color="error" onClick={handleAgree}>
          {agreebtn}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

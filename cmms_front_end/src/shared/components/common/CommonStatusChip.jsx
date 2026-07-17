import React from 'react';
import { Chip } from '@mui/material';
import { formatStatusLabel } from '../../utils/formatters';

const statusColorMap = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  PENDING: 'warning',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'success',
  MANAGER_APPROVED: 'primary',
  HR_APPROVED: 'success',
  REJECTED: 'error',
  PAID: 'success',
  ACTIVE: 'success',
  INACTIVE: 'default',
  UNREAD: 'primary',
  READ: 'default',
  ARCHIVED: 'default',
  OVERDUE: 'error',
  COMPLETED: 'success',
  CANCELLED: 'default',
  OPEN: 'info',
  CLOSED: 'success',
  CRITICAL: 'error',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'default',
};

function CommonStatusChip({ value, label, color, size = 'small', variant, sx, ...props }) {
  const normalized = String(value ?? label ?? '').toUpperCase();
  return (
    <Chip
      size={size}
      label={label || formatStatusLabel(value)}
      color={color || statusColorMap[normalized] || 'default'}
      variant={variant || (color || statusColorMap[normalized] ? 'filled' : 'outlined')}
      sx={{ maxWidth: '100%', ...sx }}
      {...props}
    />
  );
}

export default CommonStatusChip;

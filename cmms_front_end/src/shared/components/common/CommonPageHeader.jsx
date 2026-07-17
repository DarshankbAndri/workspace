import React from 'react';
import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

function renderAction(action, fallbackVariant = 'outlined') {
  if (!action) return null;
  if (React.isValidElement(action)) return action;
  const {
    label,
    icon,
    onClick,
    disabled,
    loading,
    color,
    variant = fallbackVariant,
    tooltip,
    'data-testid': dataTestId,
  } = action;

  const button = (
    <Button
      variant={variant}
      color={color}
      startIcon={icon}
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={dataTestId}
      sx={{ width: { xs: '100%', sm: 'auto' } }}
    >
      {loading ? 'Please wait...' : label}
    </Button>
  );

  return tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button;
}

function CommonPageHeader({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  primaryAction,
  secondaryActions = [],
  children,
  sx,
  titleProps,
  'data-testid': dataTestId,
}) {
  const actions = [
    ...secondaryActions.map((action) => renderAction(action, 'outlined')),
    renderAction(primaryAction, 'contained'),
  ].filter(Boolean);

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
      spacing={2}
      sx={sx}
      data-testid={dataTestId}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0 }}>
        {showBackButton && (
          <Tooltip title="Back">
            <IconButton aria-label="Go back" onClick={onBack} sx={{ mt: 0.1, flexShrink: 0 }}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" component="h1" {...titleProps}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {(actions.length > 0 || children) && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          justifyContent="flex-end"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ flexShrink: 0 }}
        >
          {actions}
          {children}
        </Stack>
      )}
    </Stack>
  );
}

export default CommonPageHeader;

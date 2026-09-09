import React from 'react';
import { Add, Delete, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Box, Button, Checkbox, FormControlLabel, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import CommonInput from './CommonInput';
import CommonDropdown from './CommonDropdown';
import { getDropdownOptions } from '../../utils/dropdownHelper';

export const newChecklistStep = () => ({ taskTitle: '', instructions: '', required: true, proofRequired: false, responseType: 'CHECKBOX', active: true });

export default function CommonChecklistEditor({ items = [], onChange, readOnly = false, title = 'Checklist' }) {
  const update = (index, field, value) => onChange(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  const move = (index, direction) => {
    const next = [...items];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  };
  return <Stack spacing={2} sx={{ my: 2 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
      <Typography variant="h6">{title}</Typography>
      {!readOnly && <Button type="button" variant="outlined" startIcon={<Add />} onClick={() => onChange([...items, newChecklistStep()])}>Add Step</Button>}
    </Stack>
    {!items.length && <Typography color="text.secondary">No steps added.</Typography>}
    {items.map((item, index) => <Box key={item.id || `new-${index}`} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      {item.sourceChecklistName && <Typography variant="caption">From {item.sourceChecklistName}</Typography>}
      <Grid container spacing={1.5} alignItems="center" sx={item.sourceChecklistName ? { mt: 0.5 } : undefined}>
        <Grid item xs={12} md={3}>
          <CommonInput fullWidth size="small" required disabled={readOnly} label={`Step ${index + 1}`} value={item.taskTitle || ''} onChange={e => update(index, 'taskTitle', e.target.value)} inputProps={{ maxLength: 200 }} />
        </Grid>
        <Grid item xs={12} md={3}>
          <CommonInput fullWidth size="small" disabled={readOnly} label="Instructions" value={item.instructions || ''} onChange={e => update(index, 'instructions', e.target.value)} inputProps={{ maxLength: 1000 }} />
        </Grid>
        <Grid item xs={12} md={2}>
          <CommonDropdown size="small" disabled={readOnly} label="Response" value={item.responseType || 'CHECKBOX'} options={getDropdownOptions('COMMON', 'checklistResponseType')} onChange={e => update(index, 'responseType', e.target.value)} />
        </Grid>
        <Grid item xs={12} md={readOnly ? 4 : 2}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <FormControlLabel label="Required" control={<Checkbox disabled={readOnly} checked={item.required !== false} onChange={e => update(index, 'required', e.target.checked)} />} />
            <FormControlLabel label="Proof" control={<Checkbox disabled={readOnly} checked={Boolean(item.proofRequired)} onChange={e => update(index, 'proofRequired', e.target.checked)} />} />
          </Stack>
        </Grid>
        {!readOnly && <Grid item xs={12} md={2}>
          <Stack direction="row" spacing={0.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Tooltip title="Move up">
              <span><IconButton aria-label="Move step up" disabled={index === 0} onClick={() => move(index, -1)}><KeyboardArrowUp /></IconButton></span>
            </Tooltip>
            <Tooltip title="Move down">
              <span><IconButton aria-label="Move step down" disabled={index === items.length - 1} onClick={() => move(index, 1)}><KeyboardArrowDown /></IconButton></span>
            </Tooltip>
            <Tooltip title="Remove">
              <IconButton aria-label="Delete step" color="error" onClick={() => onChange(items.filter((_, i) => i !== index))}><Delete /></IconButton>
            </Tooltip>
          </Stack>
        </Grid>}
      </Grid>
    </Box>)}
  </Stack>;
}

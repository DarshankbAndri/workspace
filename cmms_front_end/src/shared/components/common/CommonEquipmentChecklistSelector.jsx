import React from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, Grid, Stack, Typography } from '@mui/material';
import { getEquipmentChecklists } from '../../../features/equipment/services/equipmentService';
import { addEquipmentSteps, checklistApiError } from '../../utils/checklistSelection';
import { getDropdownOptions } from '../../utils/dropdownHelper';
import CommonChecklistEditor from './CommonChecklistEditor';
import CommonDialog from './CommonDialog';
import CommonDropdown from './CommonDropdown';
import CommonInput from './CommonInput';

export default function CommonEquipmentChecklistSelector({ equipmentId, items = [], onChange, readOnly = false }) {
  const [catalog, setCatalog] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [draftSourceIds, setDraftSourceIds] = React.useState(() => new Set());
  const [retry, setRetry] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    setCatalog(null);
    setError('');
    setLoading(false);
    setPickerOpen(false);
    setDraftSourceIds(new Set());
    if (!equipmentId || readOnly) return () => { active = false; };
    setLoading(true);
    getEquipmentChecklists(equipmentId).then(data => { if (active) setCatalog(data); })
      .catch(err => { if (active) setError(checklistApiError(err, 'Unable to load equipment checklists.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [equipmentId, readOnly, retry]);

  const selected = React.useMemo(() => new Set(items.map(item => item.sourceEquipmentChecklistItemId).filter(Boolean).map(String)), [items]);
  const groups = catalog?.groups || [];
  const standaloneItems = catalog?.standaloneItems || [];
  const hasCatalogSteps = groups.some(group => group.items?.length) || standaloneItems.length > 0;
  const selectedCount = draftSourceIds.size;

  const toggleDraft = (stepId, checked) => {
    const id = String(stepId);
    setDraftSourceIds(current => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleGroup = (group, checked) => {
    const available = (group.items || []).filter(step => !selected.has(String(step.id)));
    setDraftSourceIds(current => {
      const next = new Set(current);
      available.forEach(step => {
        if (checked) next.add(String(step.id));
        else next.delete(String(step.id));
      });
      return next;
    });
  };

  const openPicker = () => {
    setDraftSourceIds(new Set());
    setPickerOpen(true);
  };

  const closePicker = () => {
    setDraftSourceIds(new Set());
    setPickerOpen(false);
  };

  const applyPicker = () => {
    let next = items;
    groups.forEach(group => {
      const groupSteps = (group.items || []).filter(step => draftSourceIds.has(String(step.id)));
      if (groupSteps.length) next = addEquipmentSteps(next, groupSteps, group.name);
    });
    const standaloneSteps = standaloneItems.filter(step => draftSourceIds.has(String(step.id)));
    if (standaloneSteps.length) next = addEquipmentSteps(next, standaloneSteps, null);
    onChange(next);
    closePicker();
  };

  const renderSteps = (steps) => steps.map(step => {
    const stepId = String(step.id);
    const alreadySelected = selected.has(stepId);
    const checked = alreadySelected || draftSourceIds.has(stepId);
    return <Box key={step.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5, mb: 1 }}>
      <Grid container spacing={1.5} alignItems="center">
        <Grid item xs={12} md={3}>
          <CommonInput fullWidth size="small" disabled label="Step" value={step.taskTitle || ''} />
        </Grid>
        <Grid item xs={12} md={3}>
          <CommonInput fullWidth size="small" disabled label="Instructions" value={step.instructions || ''} />
        </Grid>
        <Grid item xs={12} md={2}>
          <CommonDropdown size="small" disabled label="Response" value={step.responseType || 'CHECKBOX'} options={getDropdownOptions('COMMON', 'checklistResponseType')} />
        </Grid>
        <Grid item xs={12} md={3}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <FormControlLabel label="Required" control={<Checkbox disabled checked={step.required !== false} />} />
            <FormControlLabel label="Proof" control={<Checkbox disabled checked={Boolean(step.proofRequired)} />} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={1}>
          <FormControlLabel
            label={alreadySelected ? 'Selected' : 'Select'}
            control={<Checkbox disabled={alreadySelected} checked={checked} onChange={e => toggleDraft(step.id, e.target.checked)} />}
          />
        </Grid>
      </Grid>
    </Box>;
  });

  const renderGroup = group => {
    const available = (group.items || []).filter(step => !selected.has(String(step.id)));
    const allChecked = available.length > 0 && available.every(step => draftSourceIds.has(String(step.id)));
    const someChecked = available.some(step => draftSourceIds.has(String(step.id)));
    return <Box key={group.id} sx={{ mb: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 1 }}>
        <Typography fontWeight={700}>{group.name}</Typography>
        <FormControlLabel
          label="Select whole checklist"
          control={<Checkbox disabled={!available.length} checked={allChecked} indeterminate={!allChecked && someChecked} onChange={e => toggleGroup(group, e.target.checked)} />}
        />
      </Stack>
      {renderSteps(group.items || [])}
    </Box>;
  };

  return <Stack spacing={1}>
    {!readOnly && <>
      <Typography variant="h6">Select equipment checks</Typography>
      {!equipmentId && <Typography>Select equipment to load its checklists.</Typography>}
      {loading && <Typography>Loading equipment checklists...</Typography>}
      {error && <Alert severity="error" action={<Button type="button" onClick={() => setRetry(n => n + 1)}>Retry</Button>}>{error}</Alert>}
      {catalog && <>
        {hasCatalogSteps && <Button type="button" variant="outlined" onClick={openPicker}>Select Equipment Checks</Button>}
        {!hasCatalogSteps && <Typography>No equipment checks configured. You can add custom steps below.</Typography>}
      </>}
    </>}
    <CommonChecklistEditor title="Selected checklist steps" items={items} onChange={onChange} readOnly={readOnly} />
    <CommonDialog
      open={pickerOpen}
      title="Select equipment checks"
      onClose={closePicker}
      maxWidth="lg"
      contentSx={{ pt: 1 }}
      actions={<>
        <Button type="button" onClick={closePicker}>Cancel</Button>
        <Button type="button" variant="contained" disabled={!selectedCount} onClick={applyPicker}>Done</Button>
      </>}
    >
      <Stack spacing={2}>
        {groups.map(renderGroup)}
        {!!standaloneItems.length && <Box>
          <Typography fontWeight={700} sx={{ mb: 1 }}>Standalone steps</Typography>
          {renderSteps(standaloneItems)}
        </Box>}
        {!hasCatalogSteps && <Typography>No equipment checks configured. You can add custom steps below.</Typography>}
      </Stack>
    </CommonDialog>
  </Stack>;
}

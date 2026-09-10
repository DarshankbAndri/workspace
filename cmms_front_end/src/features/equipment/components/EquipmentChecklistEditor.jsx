import React from 'react';
import { Button, Stack } from '@mui/material';
import CommonInput from '../../../shared/components/common/CommonInput';
import CommonChecklistEditor from '../../../shared/components/common/CommonChecklistEditor';

export default function EquipmentChecklistEditor({ value, onChange, readOnly = false }) {
  const groups = value?.groups || [];
  const standaloneItems = value?.standaloneItems || [];
  const updateGroup = (index, patch) => onChange({ standaloneItems, groups: groups.map((group, i) => i === index ? { ...group, ...patch } : group) });
  return <Stack spacing={2}>
    <CommonChecklistEditor title="Standalone equipment steps" items={standaloneItems} readOnly={readOnly} onChange={items => onChange({ groups, standaloneItems: items })} />
    {groups.map((group, index) => <Stack spacing={1} key={group.id || `new-${index}`}>
      <CommonInput required disabled={readOnly} label="Checklist name" value={group.name || ''} onChange={e => updateGroup(index, { name: e.target.value })} inputProps={{ maxLength: 200 }} />
      <CommonChecklistEditor title={group.name || 'Named checklist'} items={group.items || []} readOnly={readOnly} onChange={items => updateGroup(index, { items })} />
      {!readOnly && <Button type="button" color="error" onClick={() => onChange({ standaloneItems, groups: groups.filter((_, i) => i !== index) })}>Remove checklist</Button>}
    </Stack>)}
    {!readOnly && <Button type="button" onClick={() => onChange({ standaloneItems, groups: [...groups, { name: '', items: [] }] })}>Add named checklist</Button>}
  </Stack>;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { addEquipmentSteps, checklistApiError } from './checklistSelection.js';

test('selecting a whole group after a single step keeps customizations without duplicates', () => {
  const source = [{ id: 1, taskTitle: 'Inspect' }, { id: 2, taskTitle: 'Clean' }];
  const selected = addEquipmentSteps([], [source[0]], 'Daily');
  selected[0].taskTitle = 'Customized inspection';
  const result = addEquipmentSteps(selected, source, 'Daily');
  assert.deepEqual(result.map(i => i.sourceEquipmentChecklistItemId), [1, 2]);
  assert.equal(result[0].taskTitle, 'Customized inspection');
  assert.equal(result[1].sourceChecklistName, 'Daily');
  assert.equal(result[1].id, undefined);
  assert.equal(source[0].taskTitle, 'Inspect');
});

test('standalone and custom rows coexist and repeated candidates are deduplicated', () => {
  const custom = { taskTitle: 'Custom step' };
  const result = addEquipmentSteps([custom], [{ id: 4, taskTitle: 'Check' }, { id: 4, taskTitle: 'Check' }]);
  assert.equal(result.length, 2);
  assert.equal(result[0], custom);
  assert.equal(result[1].sourceChecklistName, null);
});

test('API errors preserve standard fields and correlation reference', () => {
  const message = checklistApiError({ response: { data: { code: 'VALIDATION_ERROR', message: 'Invalid', details: [{ field: 'taskTitle', message: 'Required' }], correlationId: 'trace-1' } } }, 'Failed');
  for (const value of ['VALIDATION_ERROR', 'Invalid', 'taskTitle: Required', 'trace-1']) assert.ok(message.includes(value));
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getDropdownLabel,
  getDropdownOptions,
  getDropdownValue,
  getPageDropdownConfig,
  validateDropdownConfigurations,
} from './dropdownHelper.js';

test('getPageDropdownConfig returns a registered config', () => {
  assert.equal(getPageDropdownConfig('COMMON').pageName, 'COMMON');
});

test('getDropdownOptions returns page options', () => {
  assert.equal(getDropdownOptions('COMMON', 'priority').length, 4);
});

test('getDropdownLabel returns matching label', () => {
  assert.equal(getDropdownLabel('COMMON', 'priority', 'HIGH'), 'High');
});

test('getDropdownValue returns matching value', () => {
  assert.equal(getDropdownValue('COMMON', 'priority', 'High'), 'HIGH');
});

test('getDropdownOptions falls back to COMMON by default', () => {
  assert.equal(getDropdownOptions('EQUIPMENT_MASTER', 'yesNo').length, 2);
});

test('invalid page returns null or empty options', () => {
  assert.equal(getPageDropdownConfig('INVALID_PAGE'), null);
  assert.deepEqual(getDropdownOptions('INVALID_PAGE', 'status'), []);
});

test('invalid dropdown returns empty options', () => {
  assert.deepEqual(getDropdownOptions('EQUIPMENT_MASTER', 'invalidDropdown'), []);
});

test('boolean values are preserved', () => {
  const yesNo = getDropdownOptions('COMMON', 'yesNo');
  assert.equal(yesNo[0].value, true);
  assert.equal(getDropdownLabel('COMMON', 'yesNo', false), 'No');
});

test('numeric values are preserved by validation when present', () => {
  const errors = validateDropdownConfigurations({
    NUMERIC_PAGE: {
      pageName: 'NUMERIC_PAGE',
      serviceType: 'UI',
      dropDownMasterList: {
        retryCount: [{ value: 1, label: 'One' }],
      },
    },
  });
  assert.deepEqual(errors, []);
});

test('duplicate values are reported by validation', () => {
  const errors = validateDropdownConfigurations({
    DUPLICATE_PAGE: {
      pageName: 'DUPLICATE_PAGE',
      serviceType: 'UI',
      dropDownMasterList: {
        status: [
          { value: 'ACTIVE', label: 'Active' },
          { value: 'ACTIVE', label: 'Active Again' },
        ],
      },
    },
  });
  assert.equal(errors.length, 1);
});

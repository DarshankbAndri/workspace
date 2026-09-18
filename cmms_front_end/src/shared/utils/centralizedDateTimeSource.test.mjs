import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const FORBIDDEN = [
  'new Date(',
  'Date.now(',
  '.toLocaleDateString(',
  '.toLocaleTimeString(',
  'Intl.DateTimeFormat(',
  'getTimezoneOffset(',
];

const filesUnder = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const location = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(location) : [location];
  }));
  return nested.flat();
};

test('application code obtains date and time through the shared utility', async () => {
  const files = (await filesUnder('src'))
    .filter((file) => /\.(js|jsx)$/.test(file))
    .filter((file) => !file.endsWith(path.join('shared', 'utils', 'dateTime.js')));
  const violations = [];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const token of FORBIDDEN) {
      if (source.includes(token)) violations.push(`${file} uses ${token}`);
    }
  }
  assert.deepEqual(violations, []);
});

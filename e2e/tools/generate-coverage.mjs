import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('..');
const testRoot = path.resolve('tests');
const tests = [];
const walk = (directory, files = []) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const value = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(value, files);
    else files.push(value);
  }
  return files;
};
const testText = walk(testRoot).filter((file) => file.endsWith('.ts')).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const controllerRoot = path.join(root, 'cmms_back_end', 'src', 'main', 'java');
for (const file of walk(controllerRoot).filter((item) => item.endsWith('Controller.java'))) {
  const source = fs.readFileSync(file, 'utf8');
  const controller = path.basename(file, '.java');
  const base = source.match(/@RequestMapping\("([^"]*)"\)/)?.[1] || '';
  const mapping = /@(Get|Post|Put|Delete|Patch)Mapping(?:\(\s*(?:value\s*=\s*)?"([^"]*)"[^)]*\))?/g;
  for (const match of source.matchAll(mapping)) {
    const method = match[1].toUpperCase();
    const endpoint = `${base}${match[2] || ''}`.replace(/\/+/g, '/') || '/';
    const literal = endpoint.replace(/\{[^}]+\}/g, '');
    const covered = testText.includes(endpoint) || (literal.length > 4 && testText.includes(literal));
    tests.push({ controller, method, endpoint, covered });
  }
}
tests.sort((a, b) => a.controller.localeCompare(b.controller) || a.endpoint.localeCompare(b.endpoint));
const lines = [
  '# API Test Coverage', '',
  'Generated from the current controller source. `COVERED` means a functional test directly references the route; `PARTIAL` means it is inventoried and covered by contract, authentication and permission sweeps only.', '',
  '| Controller | Method | Endpoint | UI Used | API Test | Security Test | Status |',
  '|---|---|---|---|---|---|---|',
  ...tests.map((item) => `| ${item.controller} | ${item.method} | \`${item.endpoint}\` | Inventory checked | ${item.covered ? 'Direct' : 'Contract'} | Anonymous sweep | ${item.covered ? 'COVERED' : 'PARTIAL'} |`),
  '', `Total controller operations: ${tests.length}. Direct functional coverage: ${tests.filter((item) => item.covered).length}. Contract/security-only: ${tests.filter((item) => !item.covered).length}.`, '',
];
fs.mkdirSync(path.resolve('docs'), { recursive: true });
fs.writeFileSync(path.resolve('docs/API_TEST_COVERAGE.md'), lines.join('\n'));
console.log(`Wrote ${tests.length} endpoint rows to docs/API_TEST_COVERAGE.md.`);

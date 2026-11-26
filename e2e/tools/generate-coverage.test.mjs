import { test } from 'node:test';
import assert from 'node:assert/strict';
import { controllerOperations, normalizeRoute, requestReferences } from './generate-coverage.mjs';

test('GET references do not claim POST/PUT/DELETE coverage on the same resource', () => {
  const references = requestReferences("await api.getData('/equipment'); // api.post('/equipment')");
  assert.deepEqual(references.map(({ method, route }) => [method, route]), [['GET', '/equipment']]);
});

test('template parameters match complete route segments, not resource prefixes', () => {
  const references = requestReferences('await api.putData(`/equipment/${id}/spare-bom/${bom.id}`, payload);');
  assert.equal(references[0].route, normalizeRoute('/equipment/{id}/spare-bom/{bomId}'));
  assert.notEqual(references[0].route, normalizeRoute('/equipment/{id}'));
  assert.equal(references[0].method, 'PUT');
});

test('controller annotations handle base paths, bare mappings and multipart value syntax', () => {
  const operations = controllerOperations(`@RequestMapping("/equipment") class EquipmentController {
    @GetMapping public void list() {}
    @PostMapping(value = "/{id}/documents", consumes = "multipart/form-data") public void upload() {}
    // @DeleteMapping("/not-an-endpoint")
  }`, 'EquipmentController');
  assert.deepEqual(operations.map(({ method, endpoint }) => [method, endpoint]), [
    ['GET', '/equipment'], ['POST', '/equipment/{id}/documents'],
  ]);
});

test('query strings are removed, unresolved variables and arbitrary strings are not requests', () => {
  const references = requestReferences("const text = '/equipment'; await api.get(route); await api.getData('/reports/equipment-history?siteId=1');");
  assert.equal(references.length, 1);
  assert.equal(references[0].route, '/reports/equipment-history');
});

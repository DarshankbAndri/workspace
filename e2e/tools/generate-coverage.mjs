import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const e2eRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});

export function normalizeRoute(value) {
  return ('/' + value.split('?')[0].replace(/^\/+|\/+$/g, '')).replace(/\{[^}]+\}/g, '{}');
}

export function controllerOperations(source, controller) {
  source = source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  const base = source.match(/@RequestMapping\(\s*(?:(?:value|path)\s*=\s*)?"([^"]*)"/)?.[1] || '';
  const mapping = /@(Get|Post|Put|Delete|Patch)Mapping(?:\(\s*(?:(?:value|path)\s*=\s*)?"([^"]*)"[^)]*\))?/g;
  return [...source.matchAll(mapping)].map((match) => ({
    controller, method: match[1].toUpperCase(), endpoint: base + (match[2] || '') || '/',
  }));
}

export function requestReferences(source, file = 'test.ts') {
  const syntax = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const references = [];
  const verbs = { get: 'GET', getData: 'GET', post: 'POST', postData: 'POST', search: 'POST',
    put: 'PUT', putData: 'PUT', delete: 'DELETE', deleteData: 'DELETE', patch: 'PATCH' };
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const method = verbs[node.expression.name.text];
      const argument = node.arguments[0];
      let route;
      if (argument && (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))) route = argument.text;
      if (argument && ts.isTemplateExpression(argument)) {
        route = argument.head.text + argument.templateSpans.map((span) => '{parameter}' + span.literal.text).join('');
      }
      // Unresolved route variables and loops are deliberately not guessed.
      if (method && route && !route.startsWith('{') && !route.includes('://')) {
        const line = syntax.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        references.push({ method, route: normalizeRoute(route), file, line });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(syntax);
  return references;
}

export function generateCoverage() {
  const controllers = walk(path.join(e2eRoot, '../cmms_back_end/src/main/java'))
    .filter((file) => file.endsWith('Controller.java'))
    .flatMap((file) => controllerOperations(fs.readFileSync(file, 'utf8'), path.basename(file, '.java')));
  const references = walk(path.join(e2eRoot, 'tests')).filter((file) => file.endsWith('.spec.ts'))
    .flatMap((file) => requestReferences(fs.readFileSync(file, 'utf8'), path.relative(e2eRoot, file).replaceAll('\\', '/')));
  const rows = controllers.sort((a, b) => a.controller.localeCompare(b.controller) || a.endpoint.localeCompare(b.endpoint) || a.method.localeCompare(b.method))
    .map((operation) => ({ ...operation, references: references.filter((reference) =>
      reference.method === operation.method && reference.route === normalizeRoute(operation.endpoint)) }));
  const referenced = rows.filter((row) => row.references.length).length;
  const lines = [
    '# API automation inventory', '',
    'This is a static method-and-path reference inventory, **not a test pass rate or proof of full scenario coverage**. A request can be setup, a negative assertion, or cleanup. See the scenario plan and Playwright results for behavior and execution evidence. Dynamic route variables/loops and helper calls may be undercounted. Unreferenced operations remain gaps for review; anonymous/contract sweeps do not prove business correctness.', '',
    '| Controller | Method | Endpoint | Direct request references |',
    '|---|---|---|---|',
    ...rows.map((row) => '| ' + row.controller + ' | ' + row.method + ' | `' + row.endpoint + '` | ' + (row.references.length
      ? [...new Set(row.references.map((ref) => '[' + ref.file + ':' + ref.line + '](../' + ref.file + '#L' + ref.line + ')'))].join(', ')
      : 'No statically resolved reference') + ' |'),
    '', 'Controller operations: ' + rows.length + '. Operations with direct method/path references: ' + referenced +
      '. Without a resolved direct reference: ' + (rows.length - referenced) + '.', '',
  ];
  fs.writeFileSync(path.join(e2eRoot, 'docs/API_TEST_COVERAGE.md'), lines.join('\n'));
  console.log('Inventoried ' + rows.length + ' operations; ' + referenced + ' have method/path references (not a coverage percentage).');
  return rows;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) generateCoverage();

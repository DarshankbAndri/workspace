import fs from 'node:fs';
import path from 'node:path';

export type Operation = { method: string; path: string };

function walk(target: string, output: string[]): void {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) fs.readdirSync(target).forEach((entry) => walk(path.join(target, entry), output));
  else if (/\.(js|jsx)$/.test(target)) output.push(target);
}

export function frontendOperations(): Operation[] {
  const repo = path.resolve('..');
  const files: string[] = [];
  walk(path.join(repo, 'cmms_front_end', 'src', 'features'), files);
  walk(path.join(repo, 'cmms_front_end', 'src', 'shared', 'services', 'api.js'), files);
  const found = new Map<string, Operation>();
  const pattern = /api\.(get|post|put|delete|patch)\(\s*([`'"])(.*?)\2/gs;
  files.forEach((file) => {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(pattern)) {
      const operation = { method: match[1].toUpperCase(), path: match[3].replace(/\$\{[^}]+\}/g, '{}').split('?')[0] };
      found.set(`${operation.method} ${operation.path}`, operation);
    }
  });
  return [...found.values()].sort((a, b) => `${a.path} ${a.method}`.localeCompare(`${b.path} ${b.method}`));
}

export function openApiOperations(document: { paths?: Record<string, Record<string, unknown>> }): Operation[] {
  const result: Operation[] = [];
  Object.entries(document.paths || {}).forEach(([apiPath, methods]) => {
    Object.keys(methods).forEach((method) => {
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
        result.push({ method: method.toUpperCase(), path: apiPath.replace(/\{[^}]+\}/g, '{}') });
      }
    });
  });
  return result;
}

export function permissionOperations(): Set<string> {
  const csv = fs.readFileSync(path.resolve('../cmms_back_end/src/main/resources/api-permission-mapping.csv'), 'utf8');
  return new Set(csv.split(/\r?\n/).slice(1).filter(Boolean).map((line) => {
    const [permission, apiPath, method] = line.split(',', 4);
    void permission;
    return `${method.toUpperCase()} ${apiPath.replace(/^\/api/, '').replace(/\{[^}]+\}/g, '{}')}`;
  }));
}

export const operationKey = (operation: Operation): string => `${operation.method} ${operation.path}`;

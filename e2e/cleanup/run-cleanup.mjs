import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('.env') });
const database = process.env.E2E_TEST_DATABASE_NAME || '';
const confirmation = process.env.E2E_CLEANUP_CONFIRM || '';
const allowed = process.env.E2E_ALLOW_DESTRUCTIVE_RESET === 'true';
const safeName = /(?:^|[_-])(e2e|test)(?:$|[_-])/i.test(database);
const forbidden = new Set(['production_cmms_v1', 'production_cmms_utc_v1']);
if (!allowed || !safeName || confirmation !== database || forbidden.has(database.toLowerCase())) {
  throw new Error('Cleanup refused: enable E2E_ALLOW_DESTRUCTIVE_RESET and exactly confirm a database named with e2e/test.');
}
const psqlCandidates = [process.env.E2E_PSQL_PATH, 'psql',
  'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe',
  'C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe',
  'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe'].filter(Boolean);
let psql = psqlCandidates.find((candidate) => candidate === 'psql' || fs.existsSync(candidate));
if (!psql) throw new Error('psql was not found. Set E2E_PSQL_PATH to the PostgreSQL client executable.');
const args = ['-X', '-h', process.env.E2E_DB_HOST || '127.0.0.1', '-p', process.env.E2E_DB_PORT || '5432',
  '-U', process.env.E2E_DB_USER || 'postgres', '-d', database, '-Atc', 'select current_database()'];
const childEnv = { ...process.env, PGPASSWORD: process.env.E2E_DB_PASSWORD || process.env.PGPASSWORD || '' };
let check = spawnSync(psql, args, { encoding: 'utf8', env: childEnv });
if (check.error && psql === 'psql') {
  const fallback = psqlCandidates.slice(1).find((candidate) => fs.existsSync(candidate));
  if (!fallback) throw check.error;
  psql = fallback;
  check = spawnSync(psql, args, { encoding: 'utf8', env: childEnv });
}
if (check.status !== 0 || check.stdout.trim() !== database) throw new Error(`Cleanup refused: connected database did not equal ${database}.`);
const cleanup = spawnSync(psql, [...args.slice(0, -2), '-v', 'ON_ERROR_STOP=1', '-f', path.resolve('cleanup/cleanup-e2e.sql')],
  { encoding: 'utf8', env: childEnv, stdio: 'inherit' });
if (cleanup.status !== 0) throw new Error('E2E cleanup failed and PostgreSQL rolled back the transaction.');
console.log(`Removed only E2E-prefixed fixtures from confirmed test database ${database}.`);

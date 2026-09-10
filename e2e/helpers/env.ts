import path from 'node:path';

const apiBaseUrl = process.env.CMMS_API_BASE_URL || 'http://127.0.0.1:6100/api';

export const env = {
  uiBaseUrl: process.env.CMMS_UI_BASE_URL || 'http://127.0.0.1:6200',
  apiBaseUrl: `${apiBaseUrl.replace(/\/+$/, '')}/`,
  adminUsername: process.env.CMMS_ADMIN_USERNAME || 'superadmin',
  adminPassword: process.env.CMMS_ADMIN_PASSWORD || '',
  authStatePath: path.resolve('.auth/admin.json'),
  testDatabaseName: process.env.E2E_TEST_DATABASE_NAME || '',
  dbHost: process.env.E2E_DB_HOST || '127.0.0.1',
  dbPort: process.env.E2E_DB_PORT || '5432',
  dbUser: process.env.E2E_DB_USER || '',
  dbPassword: process.env.E2E_DB_PASSWORD || '',
};

export function requireAdminCredentials(): void {
  if (!env.adminUsername || !env.adminPassword) {
    throw new Error('CMMS_ADMIN_USERNAME and CMMS_ADMIN_PASSWORD are required. Copy .env.example to .env; never commit secrets.');
  }
}

export function destructiveResetAllowed(): boolean {
  const explicit = process.env.E2E_ALLOW_DESTRUCTIVE_RESET === 'true';
  const safeName = /(?:^|[_-])(e2e|test)(?:$|[_-])/i.test(env.testDatabaseName);
  const forbidden = ['production_cmms_v1', 'production_cmms_utc_v1'].includes(env.testDatabaseName.toLowerCase());
  return explicit && safeName && !forbidden;
}

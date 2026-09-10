import { request, type FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { env, requireAdminCredentials } from '../helpers/env.js';

export default async function globalSetup(_config: FullConfig): Promise<void> {
  requireAdminCredentials();
  const api = await request.newContext({ baseURL: env.apiBaseUrl });
  try {
    const health = await api.get('actuator/health');
    if (!health.ok()) throw new Error(`Backend health failed with HTTP ${health.status()}`);
    const time = await api.get('system/time');
    if (!time.ok()) throw new Error(`System time failed with HTTP ${time.status()}`);
    const login = await api.post('auth/login', { data: { username: env.adminUsername, password: env.adminPassword } });
    if (!login.ok()) throw new Error(`Admin login failed with HTTP ${login.status()}`);
    const envelope = await login.json();
    const access = envelope.data;
    if (!access?.token || !access?.user) throw new Error('Login response did not contain token/user.');
    fs.mkdirSync(path.dirname(env.authStatePath), { recursive: true });
    fs.writeFileSync(env.authStatePath, JSON.stringify({ cookies: [], origins: [{
      origin: new URL(env.uiBaseUrl).origin,
      localStorage: [
        { name: 'token', value: access.token },
        { name: 'user', value: JSON.stringify(access.user) },
        { name: 'roles', value: JSON.stringify(access.roles || []) },
        { name: 'permissions', value: JSON.stringify(access.permissions || []) },
        { name: 'allowedSites', value: JSON.stringify(access.allowedSites || []) },
      ],
    }] }, null, 2));
  } finally {
    await api.dispose();
  }
}

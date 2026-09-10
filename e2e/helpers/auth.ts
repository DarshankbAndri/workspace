import { request, type APIRequestContext } from '@playwright/test';
import { env } from './env.js';
import { expectSuccess } from './api-envelope.js';

export async function authenticatedContext(username: string, password: string): Promise<APIRequestContext> {
  const anonymous = await request.newContext({ baseURL: env.apiBaseUrl });
  const login = await expectSuccess<Record<string, string>>(await anonymous.post('auth/login', { data: { username, password } }));
  await anonymous.dispose();
  const token = login.token || login.accessToken;
  if (!token) throw new Error(`Login response for ${username} did not contain a token.`);
  return request.newContext({ baseURL: env.apiBaseUrl, extraHTTPHeaders: { Authorization: `Bearer ${token}` } });
}

import { randomBytes } from 'node:crypto';

export function createRunId(): string {
  return `E2E-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`.toUpperCase();
}

export function uniqueCode(runId: string, suffix: string): string {
  return `${runId}-${suffix}`.slice(0, 30);
}

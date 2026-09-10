import type { TestInfo } from '@playwright/test';

type CleanupAction = { label: string; run: () => Promise<unknown> };

export class ResourceTracker {
  private readonly actions: CleanupAction[] = [];

  add(label: string, run: () => Promise<unknown>): void {
    this.actions.unshift({ label, run });
  }

  async cleanup(testInfo: TestInfo): Promise<void> {
    const failures: string[] = [];
    for (const action of this.actions) {
      try {
        await action.run();
      } catch (error) {
        failures.push(`${action.label}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (failures.length) {
      await testInfo.attach('cleanup-failures', { body: failures.join('\n'), contentType: 'text/plain' });
    }
  }
}

import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/login');
    await expect(this.page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'Username' }).fill(username);
    await this.page.locator('input[name="password"]').fill(password);
    await Promise.all([
      this.page.waitForURL((url) => !url.pathname.endsWith('/login')),
      this.page.getByRole('button', { name: /sign in/i }).click(),
    ]);
  }

  async expectLoggedOut(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login$/);
  }
}

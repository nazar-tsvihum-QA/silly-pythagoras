import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for Wikipedia Login page.
 *
 * Encapsulates all interactions with the Special:UserLogin page.
 * MediaWiki uses standard HTML form with known element IDs:
 *   - #wpName1  — username input
 *   - #wpPassword1 — password input
 *   - #wpLoginAttempt — submit button
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#wpName1');
    this.passwordInput = page.locator('#wpPassword1');
    this.loginButton = page.locator('#wpLoginAttempt');
  }

  /**
   * Navigate to the Wikipedia login page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/w/index.php?title=Special:UserLogin', {
      waitUntil: 'domcontentloaded',
    });
  }

  /**
   * Perform login with the given credentials.
   * After successful login, Wikipedia redirects to the main page.
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    // Wait for navigation after login — Wikipedia redirects to Main_Page
    await this.page.waitForURL('**/wiki/**', { timeout: 30_000 });
  }

  /**
   * Assert that the user is logged in by checking for the
   * presence of the user menu with the username.
   */
  async expectLoggedIn(username: string): Promise<void> {
    // MediaWiki shows a personal tools menu with the username
    // The user page link contains the username text
    const userLink = this.page.locator('#pt-userpage-2 a, #pt-userpage a, .mw-userlink');
    await expect(userLink).toBeVisible({ timeout: 15_000 });
  }
}

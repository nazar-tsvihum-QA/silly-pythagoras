import { test as base, expect } from '@playwright/test';
import { LoginPage, PreferencesPage, MainPage } from '../pages';

/**
 * Custom test fixture that extends Playwright's built-in test
 * with pre-configured page objects and authentication.
 *
 * Design decision: We use a custom fixture to:
 * 1. Centralize page object instantiation
 * 2. Handle login once before the test starts
 * 3. Keep test files clean and focused on test logic
 *
 * Credentials are loaded from environment variables (set in .env file)
 * to avoid hardcoding sensitive data.
 */

// Type definition for our custom fixtures
type WikipediaFixtures = {
  loginPage: LoginPage;
  preferencesPage: PreferencesPage;
  mainPage: MainPage;
  authenticatedPage: void; // fixture that ensures user is logged in
};

export const test = base.extend<WikipediaFixtures>({
  // Page Object fixtures — lazy-initialized from the current page
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  preferencesPage: async ({ page }, use) => {
    await use(new PreferencesPage(page));
  },

  mainPage: async ({ page }, use) => {
    await use(new MainPage(page));
  },

  // Authentication fixture — logs in the user before the test
  authenticatedPage: [
    async ({ page }, use) => {
      const username = process.env.WIKI_USERNAME;
      const password = process.env.WIKI_PASSWORD;

      if (!username || !password) {
        throw new Error(
          'WIKI_USERNAME and WIKI_PASSWORD environment variables must be set.\n' +
            'Create a .env file in the project root with:\n' +
            '  WIKI_USERNAME=your_username\n' +
            '  WIKI_PASSWORD=your_password'
        );
      }

      // Perform login
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(username, password);
      await loginPage.expectLoggedIn(username);

      await use();
    },
    { auto: false }, // Not auto — tests must explicitly request this fixture
  ],
});

export { expect };

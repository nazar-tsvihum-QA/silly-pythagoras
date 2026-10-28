import { test, expect } from '../fixtures/wiki.fixture';

/**
 * Test Suite: Wikipedia Interface Language Change
 *
 * Test Case ID: TC-LANG-001
 * Title: Successful interface language change by an authenticated user
 *
 * Preconditions:
 *   - User has a valid Wikipedia account
 *   - User credentials are set in .env file (WIKI_USERNAME, WIKI_PASSWORD)
 *   - Internet connection is available
 *
 * User Scenario:
 *   When an authenticated user navigates to "Preferences", and on the
 *   "User profile" tab, in the "Internationalisation" section, selects
 *   a different interface display language.
 *   Then the application interface is displayed in the language chosen by the user.
 *
 * Test Strategy:
 *   1. Log in to Wikipedia
 *   2. Navigate to Preferences
 *   3. Remember the current language setting
 *   4. Change language to French ("fr")
 *   5. Save preferences
 *   6. Verify the interface is now in French
 *   7. TEARDOWN: Restore original language to avoid polluting the account state
 *
 * We use French ("fr") as the target language because:
 *   - It has distinct, easily verifiable UI strings
 *   - "Navigation" sidebar heading becomes "Navigation" (same in French, but
 *     the "Main page" link becomes "Accueil" — very distinct)
 *   - It's a well-supported language on Wikipedia
 */

// Mapping of language codes to their expected "Main page" sidebar link text
const LANGUAGE_MAIN_PAGE_TEXT: Record<string, string | RegExp> = {
  en: 'Main page',
  // MediaWiki French uses typographic apostrophe U+2019: "Page d’accueil"
  fr: /Page d[’']accueil/,
  uk: 'Головна сторінка',
  de: 'Hauptseite',
  es: 'Portada',
};

// Target language for the test
const TARGET_LANGUAGE = 'fr';

test.describe('Wikipedia Interface Language Change', () => {
  /**
   * TC-LANG-001: Change interface language and verify it takes effect.
   *
   * Steps:
   *   1. Login as a registered user (via authenticatedPage fixture)
   *   2. Navigate to Special:Preferences
   *   3. Record the current interface language
   *   4. In the "Internationalisation" section, change language to French
   *   5. Click "Save" to apply changes
   *   6. Navigate to the Main Page
   *   7. Verify that interface elements are displayed in French
   *   8. Cleanup: restore original language setting
   *
   * Expected Result:
   *   - After saving, interface elements (sidebar links, navigation headings)
   *     are displayed in French
   *   - The "Main page" sidebar link shows "Accueil" instead of "Main page"
   */
  test('TC-LANG-001: should change interface language from English to French', async ({
    authenticatedPage,
    preferencesPage,
    mainPage,
    page,
  }) => {
    // ── Step 1: Navigate to Preferences ──────────────────────────────
    await test.step('Navigate to Preferences page', async () => {
      await preferencesPage.goto();
    });

    // ── Step 2: Record current language for cleanup ──────────────────
    let originalLanguage: string;
    await test.step('Record current interface language', async () => {
      originalLanguage = await preferencesPage.getCurrentLanguage();
      console.log(`Current interface language: "${originalLanguage}"`);
    });

    // ── Step 3: Change language to French ────────────────────────────
    await test.step('Change interface language to French (fr)', async () => {
      await preferencesPage.changeLanguage(TARGET_LANGUAGE);
      await preferencesPage.expectLanguageSelected(TARGET_LANGUAGE);
    });

    // ── Step 4: Save preferences ─────────────────────────────────────
    await test.step('Save preferences', async () => {
      await preferencesPage.savePreferences();
    });

    // ── Step 5: Verify language changed on Preferences page ──────────
    await test.step('Verify language is saved in Preferences', async () => {
      // After save, the page reloads. Verify the dropdown still shows French.
      await preferencesPage.expectLanguageSelected(TARGET_LANGUAGE);
    });

    // ── Step 6: Navigate to Main Page and verify interface language ───
    await test.step('Navigate to Main Page and verify French interface', async () => {
      await mainPage.goto();

      // Verify the "Main page" sidebar link shows French text "Accueil"
      const expectedText = LANGUAGE_MAIN_PAGE_TEXT[TARGET_LANGUAGE];
      await mainPage.expectInterfaceLanguage(expectedText);

      console.log(
        `Interface language successfully changed to French. ` +
          `Sidebar shows: "${expectedText}"`
      );
    });

    // ── Step 7 (Teardown): Restore original language ─────────────────
    await test.step('Cleanup: restore original language setting', async () => {
      // If original language was already French (e.g. from an earlier interrupted run), reset to English
      const restoreLang = originalLanguage! === TARGET_LANGUAGE ? 'en' : (originalLanguage! || 'en');
      await preferencesPage.goto();
      await preferencesPage.changeLanguage(restoreLang);
      await preferencesPage.savePreferences();
      await preferencesPage.expectLanguageSelected(restoreLang);

      console.log(`Language restored to: "${restoreLang}"`);
    });
  });
});

import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for Wikipedia Preferences page.
 *
 * Handles interaction with the Special:Preferences page, specifically the
 * "Internationalisation" / "Préférences langagières" section on the
 * "User profile" tab where the user can change the interface language.
 *
 * IMPORTANT: Wikipedia uses an OOUI/Codex combobox widget that wraps and HIDES
 * the native <select#mw-input-wplanguage>. We must interact with the visible
 * combobox input, not the hidden <select>.
 *
 * Key elements:
 *   - The native <select> with id="mw-input-wplanguage" is HIDDEN by the widget
 *   - The visible control is a combobox role element inside the language fieldset
 *   - The save button has id="prefcontrol"
 */

/**
 * Mapping of ISO language codes to their native display names.
 * Used for typing into the combobox widget which expects display names.
 */
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'français',
  uk: 'українська',
  de: 'Deutsch',
  es: 'español',
  it: 'italiano',
  pt: 'português',
  pl: 'polski',
  ja: '日本語',
  zh: '中文',
};

export class PreferencesPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate directly to the Preferences page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/wiki/Special:Preferences', {
      waitUntil: 'domcontentloaded',
    });
  }

  /**
   * Locate the visible language combobox widget.
   *
   * The combobox lives inside a <fieldset> (role="group") whose legend text
   * changes with the interface language:
   *   - English: "Internationalisation"
   *   - French:  "Préférences langagières"
   *
   * We use a regex to match both.
   */
  private getLanguageCombobox(): Locator {
    return this.page
      .getByRole('group', {
        name: /Internationalisation|Préférences langagières/i,
      })
      .getByRole('combobox');
  }

  /**
   * Get the currently selected interface language CODE (e.g. "en", "fr").
   *
   * We read from the hidden native <select> element because it stores
   * the canonical language code, while the visible combobox shows the
   * display name (e.g. "English", "français").
   *
   * Using page.evaluate() bypasses Playwright's visibility check,
   * which is necessary since the <select> is hidden by the OOUI widget.
   */
  async getCurrentLanguage(): Promise<string> {
    return await this.page.locator('#mw-input-wplanguage').evaluate(
      (el: HTMLSelectElement) => el.value
    );
  }

  /**
   * Change the interface language.
   *
   * Note on MediaWiki architecture & Playwright best practices:
   * The native <select name="wplanguage" id="mw-input-wplanguage"> is hidden by
   * MediaWiki using CSS (.mw-widgets-languageSelectWidget-select { display: none }).
   * Standard Playwright actionability checks (visible, enabled) cause `.click()`
   * or `.selectOption()` to time out on hidden elements.
   *
   * We set the value directly on the select element and dispatch both 'change'
   * and 'input' events so MediaWiki's form listener detects the modification
   * and activates the save button.
   *
   * @param languageCode - ISO language code (e.g. 'fr', 'en', 'uk')
   */
  async changeLanguage(languageCode: string): Promise<void> {
    await this.page
      .locator('#mw-input-wplanguage')
      .evaluate((el: HTMLSelectElement, code: string) => {
        el.value = code;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }, languageCode);
  }

  /**
   * Click the "Save" button to persist the preferences.
   *
   * The button text is localized (EN: "Save", FR: "Enregistrer les préférences")
   * so we use the stable #prefcontrol ID. We ensure the button is enabled and click it.
   */
  async savePreferences(): Promise<void> {
    const saveButton = this.page.locator('#prefcontrol');
    // Ensure button is enabled before clicking
    await saveButton.evaluate((btn: HTMLButtonElement) => {
      btn.disabled = false;
      btn.removeAttribute('disabled');
    });
    await saveButton.click();

    // Wait for the page to reload after saving preferences
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Assert that the preferences were saved successfully.
   */
  async expectSaveSuccess(): Promise<void> {
    const successIndicator = this.page.locator(
      '.mw-notification-content, .mw-preferences-messagebox, .successbox'
    );
    await expect(successIndicator).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Assert that the selected language code matches the expected value.
   *
   * Uses expect.poll() with page.evaluate() to read the hidden <select> value
   * with auto-retry, since the OOUI widget may update the native select
   * asynchronously.
   */
  async expectLanguageSelected(languageCode: string): Promise<void> {
    await expect
      .poll(
        async () => {
          return await this.page
            .locator('#mw-input-wplanguage')
            .evaluate((el: HTMLSelectElement) => el.value);
        },
        { timeout: 10_000 }
      )
      .toBe(languageCode);
  }
}

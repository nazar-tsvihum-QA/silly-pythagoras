import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for the Wikipedia Main Page.
 *
 * Used primarily to verify that the interface language has changed
 * by checking interface elements that are localized:
 *   - The "Main Page" heading / tab title
 *   - Navigation sidebar items
 *   - The <html lang="..."> attribute on the page
 *   - Interface elements like "Search", "Log out", sidebar headings
 */
export class MainPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the Wikipedia main page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/wiki/Main_Page', {
      waitUntil: 'domcontentloaded',
    });
  }

  /**
   * Get the `lang` attribute from the <html> element.
   * Wikipedia sets this to the interface language, not the content language.
   * However, content language and interface language may differ.
   *
   * For interface verification, we check actual UI text elements.
   */
  async getHtmlLang(): Promise<string | null> {
    return await this.page.locator('html').getAttribute('lang');
  }

  /**
   * Get the text of the "Main page" link in the sidebar navigation.
   * This text is localized according to the interface language.
   *
   * Examples:
   *   - English: "Main page"
   *   - French:  "Page d'accueil"
   *   - Ukrainian: "Головна сторінка"
   *   - German: "Hauptseite"
   */
  async getMainPageLinkText(): Promise<string> {
    // The sidebar "Main page" link has id "n-mainpage-description"
    const mainPageLink = this.page.locator('#n-mainpage-description a');
    return (await mainPageLink.textContent()) ?? '';
  }

  /**
   * Get the text of a well-known interface element for language verification.
   * We use the "Contents" / "Navigation" heading in the sidebar,
   * which is always localized.
   */
  async getNavigationHeadingText(): Promise<string> {
    const navHeading = this.page.locator('#p-navigation .vector-menu-heading-label, #p-navigation h3');
    return (await navHeading.textContent()) ?? '';
  }

  /**
   * Assert that the interface is displayed in the expected language
   * by checking a known localized UI element.
   *
   * @param expectedText - The expected localized text (or RegExp) of the "Main page" sidebar link
   */
  async expectInterfaceLanguage(expectedText: string | RegExp): Promise<void> {
    const mainPageLink = this.page.locator('#n-mainpage-description a');
    await expect(mainPageLink).toHaveText(expectedText, { timeout: 15_000 });
  }

  /**
   * Assert that a specific text is present on the page in one of the
   * interface elements (useful for verifying localization).
   */
  async expectTextInInterface(text: string): Promise<void> {
    const element = this.page.locator(`text="${text}"`);
    await expect(element.first()).toBeVisible({ timeout: 15_000 });
  }
}

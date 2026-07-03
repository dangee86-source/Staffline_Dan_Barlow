import { Before, After, Status, ITestCaseHookParameter, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { AmazonWorld } from './world';

// Cucumber's default per-step timeout is 5s, which is too short for real page
// navigations against a live site (Amazon page loads, filters, add-to-basket
// popups). Raised to match Playwright's own default test timeout (30s).
setDefaultTimeout(30 * 1000);

// Launches a fresh Chromium browser/context/page before every scenario, mirroring
// how Playwright's own `page` fixture gives each test() an isolated browser context.
// `headless: false` + `slowMo` make the run watchable locally; set headless to `true`
// for a faster/CI run.
Before(async function (this: AmazonWorld) {
  this.browser = await chromium.launch({ headless: false, slowMo: 300 });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

// Tears the browser down after every scenario, and attaches a screenshot to the
// HTML report when a scenario fails, so a failure can be diagnosed from the
// report alone without needing to re-run the suite locally.
After(async function (this: AmazonWorld, { result }: ITestCaseHookParameter) {
  if (result?.status === Status.FAILED && this.page) {
    try {
      // Best-effort only — if the failure itself left the page/context in a
      // detached state (e.g. an aborted navigation), screenshotting it can
      // throw too. That shouldn't mask the original failure or crash the hook.
      const screenshot = await this.page.screenshot();
      await this.attach(screenshot, 'image/png');
    } catch {
      // No screenshot available — the original scenario failure is still reported.
    }
  }
  await this.context?.close();
  await this.browser?.close();
});

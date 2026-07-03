import { Before, After, Status, ITestCaseHookParameter, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { AmazonWorld } from './world';

// Default per-step timeout
setDefaultTimeout(30 * 1000);

// Launches a fresh Chromium browser/context/page before every scenario
Before(async function (this: AmazonWorld) {
  this.browser = await chromium.launch({ headless: false, slowMo: 300 });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

// Closes the browser after every scenario, attaching a screenshot to the
// report if the scenario failed
After(async function (this: AmazonWorld, { result }: ITestCaseHookParameter) {
  if (result?.status === Status.FAILED && this.page) {
    try {
      const screenshot = await this.page.screenshot();
      await this.attach(screenshot, 'image/png');
    } catch {
      // No screenshot available
    }
  }
  await this.context?.close();
  await this.browser?.close();
});

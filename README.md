# Amazon Playwright Tests

[![Playwright Tests](https://github.com/dangee86-source/Staffline_Dan_Barlow/actions/workflows/playwright.yml/badge.svg)](https://github.com/dangee86-source/Staffline_Dan_Barlow/actions/workflows/playwright.yml)

Automated test suite for [amazon.co.uk](https://www.amazon.co.uk) using **Playwright** and **TypeScript** with the Page Object Model pattern.

**Repository:** [github.com/dangee86-source/Staffline_Dan_Barlow](https://github.com/dangee86-source/Staffline_Dan_Barlow)

```bash
git clone https://github.com/dangee86-source/Staffline_Dan_Barlow.git
cd Staffline_Dan_Barlow
```

---

## What is Tested

### Scenario 1 — Search and Count (5 tests)
| Test | What it checks |
|---|---|
| User lands on the Amazon website | URL contains `amazon.co.uk` |
| User searches for iPhone 17 Pro Max and sees results grid | Grid is visible after search |
| User counts grid items containing iPhone 17 Pro Max | At least 1 result contains the product name |
| User sees the result count is displayed | "results for" heading is visible on the page |
| User sees the first result is relevant to the search term | First product title contains "iPhone" |

### Scenario 2 — Filter, Select and Basket (8 tests)
| Test | What it checks |
|---|---|
| User lands on the Amazon website | URL contains `amazon.co.uk` |
| User searches for iPhone 17 Pro Max | Search completes successfully |
| User filters by top rated and verifies the filter is applied | URL contains `p_72` (Amazon's star rating filter param) |
| User selects the first result and verifies the product page title | Product page title contains "iPhone 17 Pro Max" |
| User filters by top rated and selects the first silver iPhone | Adds the highest-rated Silver iPhone to basket with protection plan |
| User navigates to the basket | URL contains `/cart` |
| User verifies the basket contains the correct product | Basket shows correct name, colour (Silver), and quantity (1) |
| User verifies the basket price, item count and subtotal | Basket price matches product page, header shows 2 items, subtotal is visible |

---

## Project Structure

```
Staffline/
├── framework/
│   ├── constants/
│   │   └── urls.ts                    # Amazon base URL constant
│   ├── fixtures/
│   │   └── amazonFixture.ts           # Shared fixture — navigates to Amazon and handles cookie/interstitial before each test
│   └── types/
│       └── product.ts                 # IProduct interface (name, colour)
├── pages/
│   ├── BasePage.ts                    # Shared locators: search box, cookie banner, "Continue shopping" handler
│   ├── AmazonHomePage.ts              # searchFor() method
│   ├── AmazonSearchResultsPage.ts     # Grid, filters, result count, first result title
│   ├── AmazonProductPage.ts           # Colour selection, add to basket, protection plan, price/title getters
│   └── AmazonBasketPage.ts            # Basket item verification: name, colour, qty, price, subtotal, header count
└── tests/
    └── amazon/
        ├── scenario1.spec.ts          # 5 tests — search and count
        └── scenario2.spec.ts          # 8 tests — filter, select and basket
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- Chromium (installed automatically with Playwright)

---

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers (first time only)
npx playwright install chromium
```

---

## Running the Tests

```bash
# Run all Amazon tests
npx playwright test tests/amazon

# Run a specific scenario
npx playwright test tests/amazon/scenario1.spec.ts
npx playwright test tests/amazon/scenario2.spec.ts

# Run headed (watch the browser)
npx playwright test tests/amazon --headed

# Run with HTML report
npx playwright test tests/amazon --reporter=html
npx playwright show-report
```

---

## BDD (Cucumber) Suite

The same coverage is also implemented as Gherkin/Cucumber scenarios in [features/amazon-search.feature](features/amazon-search.feature), with step definitions under `src/` that reuse the exact same Page Object classes as the Playwright specs above (`pages/*.ts`) — one set of page objects, two different test runners.

```
src/
├── support/
│   ├── world.ts     # Custom Cucumber World — holds the Playwright browser/page and data shared between steps
│   └── hooks.ts     # Before/After hooks — launch/close Chromium per scenario, attach a screenshot on failure
└── steps/
    └── amazon.steps.ts   # Step definitions for features/amazon-search.feature
```

```bash
# Run the BDD suite
npm run test:bdd

# Run and generate an HTML report in reports/
npm run test:bdd:report
```

Both scripts include `--retry 1`, matching the retry used in `playwright.config.ts` locally — real end-to-end tests against a live third-party site occasionally hit a one-off network/render hiccup unrelated to the code under test, so a single automatic retry filters that noise out.

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| `test.describe.configure({ mode: 'serial' })` | Amazon detects parallel requests from the same IP and throttles/blocks them |
| `waitForURL(/\/s\?k=/)` instead of `networkidle` | Amazon constantly makes background ad/analytics requests so `networkidle` never fires |
| `a[href*="/dp/"]` inside result items to click products | Skips the carousel banner at the top which has no standard product link |
| `allTextContents()` for counting | Faster than looping with individual `textContent()` calls which can timeout per item |
| `IProduct` interface with optional `colour?` | Satisfies both scenarios — Scenario 1 doesn't need colour, Scenario 2 does |
| `try/catch` for cookie banner and "Continue shopping" | Both appear intermittently and should not fail the test if absent |

---

## Configuration

Edit [playwright.config.ts](playwright.config.ts) to change browser, viewport, or timeout settings.

---

## Continuous Integration

Tests run automatically on GitHub Actions ([.github/workflows/playwright.yml](.github/workflows/playwright.yml)) on every push and pull request to `main`. The HTML report is uploaded as a workflow artifact.

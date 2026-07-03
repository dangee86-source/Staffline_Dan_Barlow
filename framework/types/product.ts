// Shape of the test data used to drive the Amazon search/basket scenarios.
// `colour` is optional because Scenario 1 (search-only) doesn't need a specific
// variant, while Scenario 2 (add-to-basket) does — see tests/amazon/*.spec.ts.
export interface IProduct {
  name: string;
  colour?: string;
}

// Reserved for a planned "compare products" scenario (comparing iPhone 17 Pro Max
// vs Pro spec-by-spec) that was never built — the comparison-table scraping proved
// too fragile to validate reliably, so features/amazon-search.feature's second
// scenario was simplified to the filter/select-colour/basket flow instead (see
// tests/amazon/scenario2.spec.ts for the equivalent, implemented version).
// Not yet consumed by any page object or test.
export interface IProductComparisonRow {
  feature: string;
  proMaxValue: string;
  proValue: string;
  color?: string;  // ? makes the color property optional
}

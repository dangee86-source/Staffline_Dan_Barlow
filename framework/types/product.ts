// Shape of the test data used to drive the Amazon search/basket scenarios.
// `colour` is optional because Scenario 1 (search-only) doesn't need a specific
// variant, while Scenario 2 (add-to-basket) does — see tests/amazon/*.spec.ts.
export interface IProduct {
  name: string;
  colour?: string;
}

// Reserved for a planned "compare products" scenario (see the second scenario in
// features/amazon-search.feature) that compares iPhone 17 Pro Max vs Pro spec-by-spec.
// Not yet consumed by any page object or test.
export interface IProductComparisonRow {
  feature: string;
  proMaxValue: string;
  proValue: string;
  color?: string;  // ? makes the color property optional
}

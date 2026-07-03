# Gherkin spec for a planned Cucumber/BDD version of the Amazon test suite.
# The equivalent coverage is implemented today with plain Playwright specs in
# tests/amazon/scenario1.spec.ts (this scenario) and scenario2.spec.ts (basket flow).
# NOTE: step definitions for these steps are not yet implemented, so
# `npm run test:bdd` will not run successfully against this file yet.
Feature: Amazon product search

  Scenario: Search and count iPhone 17 Pro Max results
    Given User lands on the Amazon website
    When User searches for iPhone 17 Pro Max
    Then User should see product results in the grid
    And User should count grid items containing only iPhone 17 Pro Max

  Scenario: Compare iPhone 17 Pro Max and verify basket
    Given User lands on the Amazon website
    When User search for iPhone 17 Pro Max
    And User selects the highest rated matching iPhone 17 Pro Max silver colour
    When User scrolls down to the compare apple iPhone product section
    And User prints the product details of iPhone 17 pro max which are different from 17 pro
    And User adds the product with 1-year Accidental Damage to the basket
    Then User should verify the product and insurance in the basket

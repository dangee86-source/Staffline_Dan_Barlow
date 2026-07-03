# Step definitions: src/steps/amazon.steps.ts
Feature: Amazon product search

  Scenario: Search and count iPhone 17 Pro Max results
    Given User lands on the Amazon website
    When User searches for iPhone 17 Pro Max
    Then User should see product results in the grid
    And User should count grid items containing only iPhone 17 Pro Max

  Scenario: Filter, select the silver iPhone and verify the basket
    Given User lands on the Amazon website
    When User searches for iPhone 17 Pro Max
    And User filters the results by top rated
    And User selects the highest rated matching iPhone 17 Pro Max silver colour
    And User adds the product with a 1-year protection plan to the basket
    Then User should verify the product and protection plan in the basket

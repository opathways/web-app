Feature: Employer Company Profile Management
  As an employer user
  I want to create and manage my company profile
  So that job seekers can learn about my organization

  Background:
    Given I am logged in as an employer user
    And I have the "EMPLOYER" role in Cognito

  Scenario: Create a new company profile
    Given I do not have an existing company profile
    When I navigate to the company profile creation page
    And I fill in the company name as "Tech Innovations Inc"
    And I fill in the company description as "Leading software development company"
    And I fill in the company location as "San Francisco, CA"
    And I fill in the company website as "https://techinnovations.com"
    And I fill in the company size as "50-100 employees"
    And I submit the company profile form
    Then I should see a success message "Company profile created successfully"
    And my company profile should be saved with the provided information
    And I should be redirected to the company profile view page

  Scenario: Edit an existing company profile
    Given I have an existing company profile with name "Tech Innovations Inc"
    When I navigate to the company profile edit page
    And I update the company description to "Premier software development firm"
    And I update the company size to "100-200 employees"
    And I save the changes
    Then I should see a success message "Company profile updated successfully"
    And the updated information should be displayed in my profile
    And the changes should be persisted in the database

  Scenario: Validation error when creating profile with missing required fields
    Given I am creating a new company profile
    When I submit the form without filling in the company name
    Then I should see an error message "Company name is required"
    And the form should not be submitted
    And I should remain on the company profile creation page

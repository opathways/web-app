Feature: Employer Job Listing Management
  As an Employer,
  I want to post and manage job listings
  So that I can attract candidates for open positions.

  Scenario: Post a new job listing
    Given I am logged in as an Employer user
    And I have an active Company Profile
    When I create a new Job Listing with a title and description
    Then the job listing is published under my company
    And it is visible to job seekers as an open position

  Scenario: Edit a job listing
    Given I am logged in as an Employer user
    And I have an existing job listing posted
    When I update the job listing details (e.g. title or description)
    Then the changes to the job listing are saved
    And job seekers see the updated job information

  Scenario: Close a job listing
    Given I am logged in as an Employer user
    And I have an open job listing
    When I mark the job listing as "Closed"
    Then the job listing becomes inactive to new applicants
    And I see the listing marked as "Closed" in my job listings dashboard

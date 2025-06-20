Feature: Employer Job Listings Management
  As an employer user
  I want to create, edit, and manage job listings
  So that I can attract qualified candidates for open positions

  Background:
    Given I am logged in as an employer user
    And I have the "EMPLOYER" role in Cognito
    And I have a complete company profile

  Scenario: Create a new job listing
    Given I am on the job listings dashboard
    When I click the "Create New Job" button
    And I fill in the job title as "Senior Software Engineer"
    And I fill in the job description as "Develop scalable web applications"
    And I select the job type as "Full-time"
    And I fill in the salary range as "$120,000 - $150,000"
    And I fill in the location as "San Francisco, CA"
    And I set the application deadline as "2025-07-20"
    And I publish the job listing
    Then I should see a success message "Job listing created successfully"
    And the job should appear in my active job listings
    And the job status should be "ACTIVE"
    And job seekers should be able to view and apply to this position

  Scenario: Edit an active job listing
    Given I have an active job listing titled "Senior Software Engineer"
    When I navigate to the job listing edit page
    And I update the salary range to "$130,000 - $160,000"
    And I update the job description to include "AWS experience required"
    And I save the changes
    Then I should see a success message "Job listing updated successfully"
    And the updated information should be displayed in the job listing
    And applicants should see the updated job details

  Scenario: Attempt to edit a closed job listing (edge case)
    Given I have a closed job listing titled "Senior Software Engineer"
    When I attempt to navigate to the job listing edit page
    Then I should see a message "Cannot edit closed job listings"
    And the edit form should not be accessible
    And I should be redirected to the job listings dashboard

  Scenario: Close an active job listing
    Given I have an active job listing titled "Senior Software Engineer"
    And the job listing has received applications
    When I navigate to the job listing management page
    And I click the "Close Job" button
    And I confirm the closure action
    Then the job status should change to "CLOSED"
    And the job should no longer accept new applications
    And existing applicants should still be visible for review

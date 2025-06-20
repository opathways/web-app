Feature: Employer Applicant Management
  As an Employer,
  I want to review and respond to job applicants
  So that I can efficiently manage the hiring process.

  Scenario: View applicants for a job listing
    Given I am logged in as an Employer user
    And at least one of my job listings has received applications
    When I view the applicant list for that job
    Then I can see each applicant's name and application details
    And each applicant's status is shown as "NEW" initially

  Scenario: Mark an applicant as In-Review
    Given I am logged in as an Employer user
    And an applicant for one of my jobs currently has status "NEW"
    When I change the applicant's status to "IN-REVIEW"
    Then the applicant's status is updated to "IN-REVIEW"
    And the change is recorded in the system for that application

  Scenario: Reject an applicant
    Given I am logged in as an Employer user
    And an applicant for one of my jobs has status "IN-REVIEW"
    When I mark the applicant as "REJECTED"
    Then the applicant's status is updated to "REJECTED"
    And the applicant is no longer under consideration for that job

  Scenario: Hire an applicant
    Given I am logged in as an Employer user
    And an applicant for one of my jobs has status "IN-REVIEW"
    When I mark the applicant as "HIRED"
    Then the applicant's status is updated to "HIRED"
    And the candidate is recorded as hired for that position

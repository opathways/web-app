Feature: Employer Applicant Management
  As an employer user
  I want to view and manage job applicants
  So that I can efficiently review candidates and make hiring decisions

  Background:
    Given I am logged in as an employer user
    And I have the "EMPLOYER" role in Cognito
    And I have active job listings with applicants

  Scenario: View applicants for a job listing
    Given I have a job listing titled "Senior Software Engineer"
    And the job has received 5 applications
    When I navigate to the applicant management page for this job
    Then I should see a list of all 5 applicants
    And each applicant should display their name, application date, and status
    And the default status for new applicants should be "NEW"
    And I should be able to sort applicants by application date
    And I should be able to filter applicants by status

  Scenario: Update applicant status from NEW to IN-REVIEW
    Given I have an applicant named "John Smith" with status "NEW"
    When I click on the applicant's profile
    And I review their resume and application materials
    And I change their status to "IN-REVIEW"
    And I add a note "Strong background, scheduling phone interview"
    And I save the changes
    Then the applicant's status should be updated to "IN-REVIEW"
    And my note should be saved and visible in the applicant's profile
    And I should see a success message "Applicant status updated successfully"

  Scenario: Hire an applicant from IN-REVIEW status
    Given I have an applicant named "Jane Doe" with status "IN-REVIEW"
    When I navigate to her applicant profile
    And I change her status to "HIRED"
    And I add a note "Excellent interview, extending offer"
    And I save the changes
    Then her status should be updated to "HIRED"
    And she should appear in the "Hired Candidates" section
    And I should see a confirmation message "Candidate marked as hired"

  Scenario: Reject an applicant with reason
    Given I have an applicant named "Bob Johnson" with status "IN-REVIEW"
    When I navigate to his applicant profile
    And I change his status to "REJECTED"
    And I add a note "Skills don't match current requirements"
    And I save the changes
    Then his status should be updated to "REJECTED"
    And he should appear in the "Rejected Candidates" section
    And I should see a confirmation message "Applicant status updated"

  Scenario: Attempt to hire applicant directly from NEW status (edge case)
    Given I have an applicant named "Alice Brown" with status "NEW"
    When I attempt to change her status directly to "HIRED"
    Then I should see a validation message "Must review applicant before hiring"
    And the status should remain "NEW"
    And I should be prompted to move to "IN-REVIEW" first

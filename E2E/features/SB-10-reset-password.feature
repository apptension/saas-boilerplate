Feature: SB-10-reset-password

  As a user
  I want to reset the password
  so that I can change it in case I forget it

  Background: User is on login page
    Given I am on 'login' page


  Scenario: User can log in using reset password
    Given I have chosen to reset my password
    And I have received an email with the link
    And I set a new password
    When I log in with a new password
    Then I am on 'home' page
    And I can see my email on 'profile' page


  Scenario: User cannot reset a password with the same link twice
    Given I have reset my password
    When I choose to reset a password again with the same link
    Then my password is not reset


  Scenario Outline: Email with a reset password link is not sent for empty or invalid email
    When I choose to reset a password with an <inputState> email
    Then I password is not reset

    Examples:
      | inputState |
      | 'empty'    |
      | 'invalid'  |


  Scenario Outline: User cannot reset a password if it doesn't meet the requirements
    Given I have chosen to reset my password
    And I have received an email with the link
    When I set a new password that is <passwordState> and confirm password that is <confirmPasswordState>
    Then my password is not reset

      Examples:
        | passwordState | confirmPasswordState |
        | 'empty'       | 'empty'              |
        | 'empty'       | 'valid'              |
        | 'valid'       | 'empty'              |
        | 'valid'       | 'common'             |
        | 'too short'   | 'too short'          |
        | 'too common'  | 'too common'         |
        | 'numeric'     | 'numeric'            |


  Scenario: Reset password link is not re-send immediately
    Given I have chosen to reset my password
    When I choose to re-send the link immediately
    Then the email with the link is not sent


  Scenario: Reset password link is re-sent 15 seconds after the previous attempt happened
    Given I have chosen to reset my password
    And I have chosen to re-send the link immediately
    When 15 seconds have passed 
    Then the email with the link is sent to me











Feature: SB-56-profile

  As a user
  I want to edit my profile information
  so that the data in the system is up to date

  Background: User is on profile page
    Given I have logged in
    And I am on 'profile' page


  Scenario Outline: User can change their <inputName>
    When I submit my new <inputName>
    Then I can see my new <inputName> in my profile

    Examples:
      | inputName                  |
      | 'first name'               |
      | 'last name'                |
      | 'first and last name' |


  Scenario: User can change their password
    Given I have provided 'valid' old password
    When I submit a new password
    Then I can log in with my new password
    And I cannot log in with my old password


  Scenario Outline: User cannot change their <inputName> if it is too long
    When I submit too long <inputName>
    Then my <inputName> is not changed

    Examples:
      | inputName                  |
      | 'first name'               |
      | 'last name'                |
      | 'first name and last name' |


  Scenario Outline: User cannot change their password if it doesn't meet the requirements
    Given I have provided <oldPasswordState> old password
    And I have provided <newPasswordState> new password
    And I have provided <confirmNewPasswordState> confirm new password
    When I choose to change my password
    Then my password is not changed
    And I can still log in with the old password

    Examples:
      | oldPasswordState | newPasswordState | confirmNewPasswordState |
      | 'valid'          | 'valid'          | 'too short'             | P must match
      | 'valid'          | 'valid'          | 'empty'                 | CP is req
      | 'valid'          | 'common'         | 'common'                | P is common BE
      | 'valid'          | 'too short'      | 'too short'             | P is short BE
      | 'valid'          | 'numeric'        | 'numeric'               | P is numeric BE
      | 'valid'          | 'empty'          | 'empty'                 | NP is req | CP is req
      | 'valid'          | 'empty'          | 'valid'                 | NP is req | P must match
      | 'invalid'        | 'valid'          | 'valid'                 | Wrong old P BE
      | 'empty'          | 'valid'          | 'valid'                 | Old P is req
      | 'empty'          | 'empty'          | 'empty'                 | Old P is req | NP is req | CP is req
      | 'empty'          | 'empty'          | 'valid'                 | Old P is req | NP is req


Feature: SB-9-registration

  As a user
  I want to register using the email/password credentials
  so that I can log into the app

  Background: User is on signup page
    Given I am on 'signup' page


  Scenario Outline: User can register with different type of accounts
    When I register with <accountType> account
    Then confirmation email is sent to me
    And I am logged in
    And I can see my email on 'profile' page

    Examples:
      | accountType |
      | 'standard'  |
      | 'Google'    |
      | 'Facebook'  |


  Scenario: User can confirm their account using a link in confirmation email
    Given I have registered with 'standard' account
    And confirmation email was sent to me
    When I confirm my account
    Then I can see a confirmation message
    And I can navigate to the app


  Scenario Outline: User can read Terms and conditions and Privacy policy pages before accepting it
    When I choose to see the content of the <pageName> page
    Then Then I am on <pageName> page

      Examples:
        | pageName               |
        | 'Terms and conditions' |
        | 'Privacy policy'       |


  Scenario: User can switch to the login page if they already have an account
    Given I have already registered
    When I choose to log in to the app
    Then I am on 'login' page


  Scenario Outline: User cannot register if required fields are not filled correctly
    When I register with a <liginState> email and a <passwordState> password and a <checkboxState> Terms checkbox
    Then I can see that login is <loginState> and password is <passwordState> and Terms checkbox is <checkboxState>
    And I haven't received registration confirmation email
    And my account is not created
    And I am not logged in

    Examples:
      | loginState | passwordState | checkboxState |
      | 'empty'    | 'empty'       | 'selected'    |
      | 'empty'    | 'empty'       | 'unselected'  |
      | 'empty'    | 'too short'   | 'selected'    |
      | 'empty'    | 'too short'   | 'unselected'  |
      | 'empty'    | 'too common'  | 'selected'    |
      | 'empty'    | 'too common'  | 'unselected'  |
      | 'empty'    | 'valid'       | 'selected'    |
      | 'empty'    | 'valid'       | 'unselected'  |
      | 'invalid'  | 'too short'   | 'selected'    |
      | 'invalid'  | 'too short'   | 'unselected'  |
      | 'invalid'  | 'too common'  | 'selected'    |
      | 'invalid'  | 'too common'  | 'unselected'  |
      | 'invalid'  | 'empty'       | 'selected'    |
      | 'invalid'  | 'empty'       | 'unselected'  |
      | 'invalid'  | 'valid'       | 'selected'    |
      | 'invalid'  | 'valid'       | 'unselected'  |
      | 'valid'    | 'too short'   | 'selected'    |
      | 'valid'    | 'too short'   | 'unselected'  |
      | 'valid'    | 'too common'  | 'selected'    |
      | 'valid'    | 'too common'  | 'unselected'  |
      | 'valid'    | 'empty'       | 'selected'    |
      | 'valid'    | 'empty'       | 'unselected'  |
      | 'valid'    | 'valid'       | 'unselected'  |
      | 'existing' | 'valid'       | 'selected'    |
      | 'existing' | 'valid'       | 'unselected'  |
      | 'existing' | 'too short'   | 'selected'    |
      | 'existing' | 'too short'   | 'unselected'  |
      | 'existing' | 'too common'  | 'selected'    |
      | 'existing' | 'too common'  | 'unselected'  |
      | 'existing' | 'empty'       | 'selected'    |
      | 'existing' | 'empty'       | 'unselected'  |



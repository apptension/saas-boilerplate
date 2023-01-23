Feature: SB-8-login

  As a user
  I want to log in using email/password
  so that I can see my personalized data

  Background: User is on login page
    Given I am on 'login' page


  Scenario Outline: User can log in using different type of accounts
    When I log in with <accountType> account
    Then I am on 'home' page
    And I can see my email on 'profile' page

      Examples:
        | accountType |
        | 'standard'  |
        | 'Google'    |
        | 'Facebook'  |


  Scenario Outline: User can navigate to Reset password and Signup pages
    When I choose to <pageName>
    Then I am on a <pageName> page

      Examples:
        | pageName         |
        | 'reset password' |
        | 'signup'         |


  Scenario Outline: User cannot log in if email and/or password are invalid or empty
    When I log in with a <liginState> email and a <passwordState> password
    Then I can see that login is <loginState> and password is <passwordState>
    And I am not logged in

      Examples:
        | loginState     | passwordState |
        | 'empty'        | 'empty'       |
        | 'empty'        | 'invalid'     |
        | 'empty'        | 'valid'       |
        | 'invalid'      | 'invalid'     |
        | 'invalid'      | 'empty'       |
        | 'invalid'      | 'valid'       |
        | 'valid'        | 'invalid'     |
        | 'valid'        | 'empty'       |


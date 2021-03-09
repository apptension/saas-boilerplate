Feature: SB-66-logout

  As a user
  I want to log out from the application
  so that I can safely end my session

  Background: User is logged in
    Given I am logged in
    And I am on 'home' page

  Scenario: User can log out
    When I log out from the application
    Then I am on 'login' page
    And I am not logged in

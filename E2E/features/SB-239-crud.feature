Feature: SB-239-CRUD

  As a Developer 
  I want to generate a model and CRUD UI easily 
  so I don't have to manually create it each time.


  Background: User is on CRUD page
    Given I have logged in
    And I am on 'CRUD' page


  Scenario: User can add new CRUD item
    Given I am on page for adding new CRUD items
    When I choose to add CRUD item
    Then I can see a success snackbar
    And added CRUD item is on the list


  Scenario: User can preview CRUD item
    Given I have created CRUD item
    When I choose to preview CRUD item
    Then I am on page with CRUD item
      

  Scenario: User can change the name of CRUD item
    Given I have created CRUD item
    When I choose to change the name of CRUD item
    Then I can see CRUD item on the list with its name changed


  Scenario: User can delete CRUD item
    Given I have created CRUD item
    When I choose to delete CRUD item
    Then CRUD item is no longer on the list


  Scenario Outline: User cannot create CRUD item if name is empty or too long
    Given I am on page for adding CRUD items
    When I choose to add CRUD item with <nameState> name
    Then I can see warning that name is <nameState>
    And CRUD item is not created

      Examples:
        | nameState  | 
        | 'empty'    |
        | 'too long' |   
       
 
 Scenario Outline: User cannot change CRUD item name if it is empty or too long
    Given I have created CRUD item
    When I choose to make CRUD item name <nameState>
    Then I can see warning that name is <nameState>
    And the name of CRUD item is not changed

      Examples:
        | nameState  | 
        | 'empty'    |
        | 'too long' |   


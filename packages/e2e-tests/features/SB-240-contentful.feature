Feature: SB-240-contentful

    As a User 
    I want to boost an article 
    so I can indicate that I enjoy the content

    Background: User is on 'Demo Contentful' page
        Given I have logged in

    Scenario: User can see the list of Contentful demo items
        When I navigate to 'Demo Contentful' page
        Then I can see the list of items
        And each item contains a thumbnail and a title


    Scenario: User can add item to favorites
        Given I am on 'Demo Contentful' page
        When I add an item to favorites
        Then I can see that item is added to favorites


    Scenario: User can remove item from favorites
        Given I am on 'Demo Contentful' page
        And I have added an item to favorites
        When I remove an item from favorites
        Then I can see that the item is no longer added to favorites


    Scenario: User can see the content of Contentful item
        Given I am on 'Demo Contentful' page
        When I choose to know more about Contentful item
        Then I can see the full content of Contentful item

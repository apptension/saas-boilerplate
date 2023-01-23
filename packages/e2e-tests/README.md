# E2E tests for Saas Boilerplate

## Prerequisites

- Install [Node.js](https://nodejs.org/en/download/package-manager/#macos) `14+` (with NPM >= 6)

## Installation

After cloning the repository, navigate to `e2e` directory and install packages:

```npm
npm i
```

## Users account setup

In order to run the tests, it is required to create 5 accounts in the app manually using `Gmail` email address:

- the main account, for example: `user@gmail.com`
- the login account - use the main account with the `+login` alias, for example: `user+login@gmail.com`
- the signup account - use the main account with the `+signup` alias, for example: `user+signup@gmail.com`
- the password reset account - use the main account with the `+resetPassword` alias, for example: `user+resetPassword@gmail.com`
- the change password account - use the main account with the `+changePassword` alias, for example: `user+changePassword@gmail.com`

If you want to run the tests against multiple environments, like `qa` or `stage`, then make sure to create the above user accounts on each of those environments.

## Cypress environment variables

Once the accounts have been created, put the main email and its password as an env variables in the `cypress.env.json` file - there is an example file provided in the root directory.

Provide values for the `BASIC_AUTH_LOGIN`, `BASIC_AUTH_PASSWORD` and `BASIC_AUTH_HEADER` environment variables, where header is a `base64` encoded `BASIC_AUTH_LOGIN:BASIC_AUTH_PASSWORD`.

## Gmail environment variables

There are tests that use a `Gmail API` under the hood to retrieve the links from emails and complete the whole password reset and signup flows.

To make it work we need to do a few things:

1. enable API in your main test Gmail account:
   - navigate to the Google [console](https://developers.google.com/gmail/api/quickstart/nodejs)
   - make sure you are logged in with your main test Gmail account
   - click on the `Enable the Gmail API` button
   - choose any name for your project and click on `Next`
   - select the `Desktop app` and click on `Create` button
   - click on `Download client configuration` button - it will download the `credentials.json` file
2. create environment variables based on values from the downloaded `credentials.json` file
   - extract values for `client_id`, `client_secret` and `redirect_uris` and put them in the `.env` file - there is an example file provided in the root directory
   - the `redirect_uris` is an array - store its values in an `.env` file as a string where each value is separated by a comma
3. generate a `token.json` file
   - in terminal, navigate to `e2e/cypress/support/gmailapi`
   - run the command:
     ```node
     node index.js
     ```
   - there will be a prompt with the link asking to put a code there - open the link in the browser
   - log in with your test Gmail account or select it from the list of remembered accounts
   - there might be a message about the app not being verified by Google - click on `Advanced` and then click on `Open: "yourProjectName"`
   - there will be a prompt asking to grant access to your Gmail account
   - after granting the access to the Gmail account there will be a code displayed - copy it, paste in the terminal and hit Enter
   - there will be a message confirming that the token has been stored in the `token.json` file
4. put tokens as Gmail environment variables
   - open the `token.json` file stored in `e2e/cypress/support/gmailapi` directory
   - extract the `access` and `refresh` tokens and put in the `.env` file

All of the above has to be done just once - after that, if the access token expires, it will be seamlessly refreshed using the refresh token.

## Contentful demo items tests

Tests located in `contentful.spec.js` file require that at least one demo item is created in connected Contentful instance.

In order for tests not to fail make sure to create at least one Contentful demo item or skip those tests completely.

## Running tests locally

In order to have the best development and debugging experience it's recommended to run the tests in headed mode, with the testrunner displayed, where we can select which spec file to run and against what browser. In the terminal run the command:

```npx
npx cypress open
```

To run all the tests in headless mode run the command:

```npx
npx cypress run
```

The tests will be run on an `Electron` browser, which is a default browser shipped with Cypress.

To run the tests in headless mode on either `Chrome`, `Firefox` or `Edge` browsers, use dedicated scripts from package.json:

- Chrome: `npm run all:headless:chrome:qa`
- Firefox: `npm run all:headless:ff:qa`
- Edge: `npm run all:headless:edge:qa`

## Generating reports

After running tests locally in headless mode, there will be a default report in the terminal displayed.

There is also a `generate:report` script available, which generates a `report.html` file in `e2e/mochareports` directory using the `mochawesome` reporter. It's recommended to use the `pretest:clear` script before running tests, so the report contains the data from the latest run only.

## Runnig tests in CI

In order to run the tests in CI it's required to put all the environment variables from `.env` and `cypress.env.json` files in the `AWS System manager > Parameter store` and prefix them with the `/env-saas-qa-e2e/`, for example: `/env-saas-qa-e2e/CYPRESS_EMAIL`

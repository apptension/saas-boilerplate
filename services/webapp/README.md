This project was bootstrapped
with [Create React App (by Apptension)](https://github.com/apptension/react-scripts-apptension).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more
information.

### `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will
remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right
into your project so you have full control over them. All of the commands except `eject` will still work, but they will
point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you
shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t
customize it when you are ready for it.

### `yarn extract-intl language1, language2, [...]`

Automatically generates `.json` files with messages gathered from application.

### `yarn lint`

Lints your JavaScript.

### `yarn plop`

Generate Redux module (reducer, saga, selectors, action types, action creators, tests):

```Shell
yarn plop module
```

Generate Redux container and its react component in specified path:

```Shell
yarn plop container
```

Generate React component (class or function) in specified path

```Shell
yarn plop component
```

### `yarn contentful:download-schema`

It introspects remote Contentful GraphQL API endpoint and generates `schema.graphql` file based on current content-model
structure on Contentful

## Learn More

You can learn more on [Create React App (by Apptension)](https://github.com/apptension/react-scripts-apptension).

## Make rules

### `make install`

You should configure this rule in Makefile to install web app's dependencies

#### Example rule

```makefile
test:
	npm install
```

### `make install-deploy`

This rule will be used by CodeBuild to install dependencies required to deploy previously built artifact.
This rule should most likely stay unchanged unless you know what you're doing!

### `make test`

You should configure this rule in Makefile to run your web app's tests and linters

#### Example rule

```makefile
test:
	npm run test
```

### `make build`

You should configure this rule in Makefile to run your web app's build step

#### Example rule

```makefile
build: test
	npm run build
```

### `make deploy`

This rule will deploy the app to AWS. Make sure you log in to AWS first using `make aws-vault` command.

## Django REST API integration

Project is configured with fully typed support for REST API.

All request can be provided with response type:

```typescript
import { client } from './services/api/client';
//...
export const list = async () => {
  const res = await client.get<ItemType[]>(API_URL);
  return res.data; // data is ItemType[]
};
```

### Form submission errors

Every POST/PUT response type from BE is formatted in following way:

```json
#successfull response
{
  "isError": "false",
  "dataKey1":"dataVal1",
  "dataKey2":"dataVal2"
}
```

```json
#failed response
{
  "isError": "true",
  "fieldKey1":["field-error-1"],
  "nonFieldErrors":["non-field-error"]
}
```

It allows us to support TS types for API error handling.
To support form submit with validation, you can use out-of-the-box solution based on `react-hook-form / useForm()`:

Example:

```typescript
// api
export const updateProfile = async (data: UpdateProfileApiRequestData) => {
  const res = await client.put<UpdateProfileApiResponseData>(AUTH_UPDATE_PROFILE_URL, data);
  return res.data;
};

// saga
takeLatest(authActions.updateProfile, handleApiRequest(auth.updateProfile)),


// component
const {setApiResponse, errors, genericError, ...} = useApiForm<UpdateProfileFormFields>();

const onProfileUpdate = async (profile: UpdateProfileFormFields) => {
  try {
    const res = await dispatch(updateProfile(profile));

    // dispatch promise is resolved in case of 2xx or 400 status code

    // in case of 400 status results with resolved promise but with submission errors returned
    // it will fill 'errors' variable with field errors coming from API response
    // or 'genericError' with generic errors (not related with specific form field)
    setApiResponse(res);
  } catch {
    // you can handle any other unexpected errors here
  }
};

```

## Contentful integration

Project is configured with Contentful integration with full GraphQL and Typescript support.

To use it .env variables must point to your contentful environment:

```dotenv
REACT_APP_CONTENTFUL_SPACE=<CHANGE_ME>
REACT_APP_CONTENTFUL_TOKEN=<CHANGE_ME>
REACT_APP_CONTENTFUL_ENV=develop
```

Whenever Contentful model changes, you should run `yarn contentful:download-schema` to update local schema to match with
remote contentful model.

### Creating queries

To create a new Contentful query, you need to create it inside `shared/services/contentful/queries/*.graphql` file. It
will be used to automatically generate fully typed API.

### Example:

```graphql
# shared/services/contentful/queries/demoItems.graphql

query demoItem($itemId: String!) {
  demoItem(id: $itemId) {
    title
    description
  }
}
```

### Usage with hooks

```typescript jsx
// useDemoItemQuery hook is generated automatically, with full TS support, based on your query defined in `.graphql` file
import { useDemoItemQuery } from '../../shared/services/contentful/hooks';

export const Example = () => {
  const { data, loading } = useDemoItemQuery({ variables: { itemId: id } });
  const title = data?.demoItem?.title; // const title: string | undefined
  const foo = data?.demoItem?.foo; // ERROR: property `foo` does not exist
  //  ...
};
```

### Usage with imperative API calls

```typescript
import { client } from '../../shared/services/contentful';
// ...
const { demoItem } = await client.demoItem({ itemId: id });
const title = demoItem?.title; // const title: string | undefined
const foo = demoItem?.foo; // ERROR: property `foo` does not exist
//...
```

## CRUD generator

Project is configured with simple CRUD UI generator.

To generate a fully-functional CRUD UI you need to run `yarn plop crud <model_name> <api_endpoint>` (i.e. `yarn plop crud event /event/`)

It will generate functional elements including:

Routes:

- `ROUTES.<model_name>.list` under `/<model_name>/` (i.e. ROUTES.event.list under /event/)
- `ROUTES.<model_name>.details` under `/<model_name>/<id>`
- `ROUTES.<model_name>.edit` under `/<model_name>/edit/<id>`
- `ROUTES.<model_name>.add` under `/<model_name>/add`

Actions:

- `<model_name>Actions.fetch<model_name>List` - to fetch all items data (i.e. `eventActions.fetchEventList`)
- `<model_name>Actions.fetch<model_name>` - to fetch single item data
- `<model_name>Actions.add<model_name>` - to add new item
- `<model_name>Actions.update<model_name>` - to update existing item
- `<model_name>Actions.delete<model_name>` - to delete existing item

Each generated route will contain functional components (listing / editing / adding / deleting).
All you need to do is to adjust it with your data model - by default it is generated using following data model:

```typescript
interface <model_name> {
  id: string;
  name: string;
}
```

## Emails

Default templates are prepared to support Gmail, Apple mail client and Microsoft Outlook.

### Adding new email template

To add new email template you need to:

- add new file in `src/emails`. It should export `Template` and `Subject` components.
- add new email `EmailTemplateType` enum value in `src/emails/types.ts`
- assign your component with new type in `src/emails/templates.config.ts`

### Testing email templates

You can test email templates using storybooks and wrapping email with `EmailStory`:

```typescript jsx
const StorybookTemplate: Story<PasswordResetProps> = (args) => (
  <EmailStory type={EmailTemplateType.PasswordReset} subject={<PasswordResetSubject />} emailData={args}>
    <PasswordResetEmail {...args} />
  </EmailStory>
);
```

It allows you to see email subject & template within the storybook.
It also shows a button to send each email to specific email address.

To be able to use email send button you need to run storybook using your AWS credentials and have the recipient email whitelisted in SES by project admin.

Example usage:

```shell
aws-vault exec saas-boilerplate-user -- yarn storybook

```

### Using static assets in the template

- To use static assets in email, they must be saved inside `/public/email-assets/` folder.
- You should reference them by using `PUBLIC_BUCKET_URL` url, i.e. `<img src={`${process.env.PUBLIC_BUCKET_URL ?? ''}/email-assets/image.png`} />`
- `PUBLIC_BUCKET_URL` must point to public website URL (alternatively directly to s3 bucket, in case of environment protected by basic auth)

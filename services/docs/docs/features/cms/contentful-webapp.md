---
title: Contentful Web App Integration
sidebar_title: Web App Integration
---

Project is configured with Contentful integration with full GraphQL and Typescript support.

## Running locally

Set environmental variables in the `services/webapp/.env` file.
If it doesn't exist create it using `services/webapp/.env.example` first.

:::info
Use the Contentful Delivery API token here.
:::

```
REACT_APP_CONTENTFUL_SPACE=<CHANGE_ME>
REACT_APP_CONTENTFUL_TOKEN=<CHANGE_ME>
REACT_APP_CONTENTFUL_ENV=develop
```

## Updating local schema to match Contentful remote one

Whenever Contentful model changes, you should run `yarn graphql:download-schema` to update local schema to match with
remote contentful model.

It introspects remote Contentful GraphQL API endpoint and generates `schema.graphql` file based on current content-model
structure on Contentful

## Running in AWS

##### Start AWS vault session

Run following command in the root of your project:

```shell
make aws-vault ENV_STAGE=<CHANGE_ME>
```

##### Set variables in AWS

First start the SSM editor tool by running following command in the root of your project:

```shell
make -C services/webapp secrets
```

Variables are set in a JSON format so add following keys:

```json
{
  "REACT_APP_CONTENTFUL_SPACE": "<CHANGE_ME>",
  "REACT_APP_CONTENTFUL_TOKEN": "<CHANGE_ME>"
  "REACT_APP_CONTENTFUL_ENV": "<CHANGE_ME>"
}
```

## Creating queries

To create a new Contentful query, you need to create it inside `shared/services/contentful/queries/*.graphql` file. It
will be used to automatically generate fully typed API.

### Example

```graphql
# shared/services/contentful/queries/demoItems.graphql

query demoItem($itemId: String!) {
  demoItem(id: $itemId) {
    title
    description
  }
}
```

## Usage with hooks

```typescript jsx
// useDemoItemQuery hook is generated automatically, with full TS support, based on your query defined in `.graphql` file
import { useDemoItemQuery } from "../../shared/services/contentful/hooks";

export const Example = () => {
  const { data, loading } = useDemoItemQuery({ variables: { itemId: id } });
  const title = data?.demoItem?.title; // const title: string | undefined
  const foo = data?.demoItem?.foo; // ERROR: property `foo` does not exist
  //  ...
};
```

## Usage with imperative API calls

```typescript
import { client } from "../../shared/services/contentful";
// ...
const { demoItem } = await client.demoItem({ itemId: id });
const title = demoItem?.title; // const title: string | undefined
const foo = demoItem?.foo; // ERROR: property `foo` does not exist
//...
```

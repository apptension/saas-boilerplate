---
title: GraphQL Relay
---

Project comes configured with [Relay](https://relay.dev/), GraphQL client by Facebook. Relay enforces the best GraphQL practices, scales well and speeds up the development process while keeping the best quality. 

## Schema generation

Your IDE can understand GraphQL schema very well if you provide static `.graphql` file. To generate this file out of the backend schema and Contentful schema simply run `yarn graphql:download-schema && yarn graphql:generate-types`. You have to run these commands each time the backend or Contentful is updated.

:::note

You might have to install extension: [Jetbrains](https://plugins.jetbrains.com/plugin/8097-js-graphql), [VSC](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql)

:::

## Generating Relay files

`Relay Compiler` analyses the `graphql` literals (your queries, mutations and subscriptions) and produces files that are used by `Relay` at runtime and `TypeScript` types. `Relay Complier` is run in watch mode always when you run the app with `yarn start`, but you can run it manually with `yarn relay`. Generated files are saved in the `src/__generated__` and are versioned, but hidden in the Bitbucket's changelog. 

:::note

You must have `watchman` for watch mode to work. You can install it by running `brew install watchman` 

:::

## Writing queries

To write GraphQL query you need to `import graphql from 'babel-plugin-relay/macro';` instead of `react-relay`. It's important to use macro, because we don't want to eject the `CRA`.

## Mutations

Utilize `src/services/graphqlApi/usePromiseMutation` helper to write mutation wrapped with `Promise`


```typescript
const [commitDeleteMutation] = usePromiseMutation(graphql`...`);

const handleDelete = async () => {
  await commitDeletMutation({
    variables: { id }, 
  });
}
```

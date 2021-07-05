---
id: graphql-subscriptions
title: GraphQL Subscriptions
---

Project is configured with the GraphQL Subscriptions sent over WebSockets out of the box.


## Webapp reference

All you have to configure is `REACT_APP_SUBSCRIPTIONS_URL` environment variable. After that simply use [relay's useSubscription](https://relay.dev/docs/api-reference/use-subscription/).

### Removing the feature

WebSocket connection is established just when the application starts. You should remove this feature if:

- you don't use Subscriptions by yourself
- you have removed Notifications feature

Steps to remove:

- Delete `subscribe` IIFE, and it's usage from  the `src/shared/services/graphqlApi/relayEnvironment.ts`
- Remove `subscriptions-transport-ws` package
- Remove `REACT_APP_SUBSCRIPTIONS_URL` env variable from `.env`, `.env.example` and `.env.tests` files
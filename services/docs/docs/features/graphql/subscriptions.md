---
title: Subscriptions
---

Project comes with support to GraphQL Subscriptions through WebSockets. WebSockets connections are established and maintained with the help of AWS WebSocket Api Gateway. This Api Gateway is deployed as a part of Components Stack.

For handling `$connect`, `$default` and `$disconnect` routes there are three AWS Lambda functions defined inside workers: `WebSocketsConnectHandler`, `WebSocketsMessageHandler` and `WebSocketsDisconnectHandler`.

## Use cases handled by AWS Lambda functions

### Connecting

When user connects to WebSocket, he is being identified based on token provided in Cookie header. If user is found, `connectionId` provided by Api Gateway is saved for that user in database (with `WebSocketConnection` model).

### Client -> Server communication

#### Initializing connection

When relay sends `connection_init` message, lambda sends back `connection_ack` response.

#### Starting subscription

When relay sends `start` message, lambda creates new `GraphQLSubscription` instance in the database, storing user's query, variables, operation name and subscription id.

#### Stopping subscription

When relay sends `stop` message, lambda deletes existing `GraphQLSubscription` instance from the database.

### Disconnecting

When user disconnects from the WebSocket, `WebSocketConnection` and all potential instances of `GraphQLSubscription` related to that connection are deleted from the database.

## Server -> Client communication

When we want to send message to the connected user, we need to utilize API Gateway Management API. To make it easier, there's ready `send_subscriptions_messages` function that can be found in `apps.websockets.utils` module. Sample usage:
```python
utils.send_subscriptions_messages(instance.user, "notificationsSubscription", root_value=[instance])
```
It requires two parameters: `user` and `operation_name`. It also accepts `**kwargs` parameters. When called, it checks for all open subscriptions with provided `operation_name` for specified `user`. For all found subscriptions, it executes query that user provided when starting the subscription. All `kwargs` are passed to the `execute` function called on the GraphQL schema. One common use case may be to provide `root_value` as a parameter to the `send_subscriptions_messages` function, so that it serves as a root for the query execution (like notification instance in the example above). 

## Webapp reference

All you have to configure is `REACT_APP_SUBSCRIPTIONS_URL` environment variable. After that simply use [relay's useSubscription](https://relay.dev/docs/api-reference/use-subscription/).

### Removing the feature

You should remove this feature if:

- you don't use Subscriptions by yourself
- you have removed Notifications feature

Steps to remove:

- Delete `SUBSCRIPTIONS_URL, subscriptionClient, subscribe` and it's usages from  the `src/shared/services/graphqlApi/relayEnvironment.ts`
- Remove `subscriptions-transport-ws` package
- Remove `REACT_APP_SUBSCRIPTIONS_URL` env variable from `.env`, `.env.example` and `.env.tests` files

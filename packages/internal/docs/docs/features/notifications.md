---
title: Notifications
---

Project is configured with the in-app notifications support out of the box. Backend and frontend share the `type` which is a `CONSTANT_CASED` identifier. Notifications are handled with GraphQL Subscriptions.

## Webapp reference

To generate a new notification simply run:

```shell
yarn plop notification <type>
```

> `type' is the notification identifier and name at once

It generates `component` and `story` files under the `src/shared/components/notifications/templates/<type>/` path. The notification is automatically registered, no further actions required.

In the `<type>.component.tsx` you will see the component based on the `<Notification/>` which is an interface to compose your notification. You have to define the `data` inside `NotificationType`:


```typescript
type ItemAddedProps = NotificationType<{
  user: string | null;
  itemId: number;
}>;
```

:::caution

Mistakes in the data type (e.g., missing nulls) might produce error-prone code. Be careful!

:::

### Removing the feature

- Delete `<Notifications />` usage from the `src/shared/components/header/header.component.tsx`
- Delete `src/shared/components/notifications` directory
- Delete `addNotificationGenerator` call from  the`plopfile.js`
- Delete `plop/notification` directory


## Backend reference

Backend comes with a built-in support for in-app notifications, and possibility to implement other types of notifications.

### Strategies

Enabled notifications strategies are configurable with `NOTIFICATIONS_STRATEGIES` variable in `settings.py` file. Its default value is `["InAppNotificationStrategy"]`.

To write your own notifications strategy, you need to extend the `BaseNotificationStrategy` class that can be found in `apps/notifications/strategies.py` file. The only method that needs to be implemented is:

```python
@staticmethod
def send_notification(user: str, type: str, data: dict):
    ...
```

There's also second method, that may sometimes come in handy:

```python
@staticmethod
def should_send_notification(user: str, type: str):
    ...
```

With that method you can decide, if specific user should receive notification with specific type with that strategy.

### Sending notifications

To send notification to users you simple need to call `send_notification` function that can be found in  `apps.notifications.sender` module. It iterates through all enabled strategies and sends notification with specified type and payload to specified user.

### Removing the feature

- Delete `apps/notifications` directory
- Remove `apps.notifications` from `LOCAL_APPS` variable in `settings.py` file

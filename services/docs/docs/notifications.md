---
id: notifications
title: Notifications
---

Project is configured with the in-app notifications support out of the box. Backend and frontend share the `type` which is a `CONSTANT_CASED` identifier.

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

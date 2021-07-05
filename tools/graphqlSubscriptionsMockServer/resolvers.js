import { PubSub } from "graphql-subscriptions";
import faker from "faker";

const pubsub = new PubSub();

const ACTIONS = {
  NOTIFICATION_CREATED: "NOTIFICATION_CREATED",
};

export const resolvers = {
  ApiSubscription: {
    notificationCreated: {
      subscribe: () => pubsub.asyncIterator([ACTIONS.NOTIFICATION_CREATED]),
    },
  },
};

setInterval(() => {
  pubsub.publish(ACTIONS.NOTIFICATION_CREATED, {
    notificationCreated: {
      edges: [
        {
          node: {
            id: faker.datatype.uuid(),
            type: "CRUD_ITEM_CREATED",
            createdAt: new Date().toISOString(),
            readAt: null,
            data: {
              id: "mock",
              name: "CRUD ITEM",
              user: "example@example.com",
            },
          },
        },
      ],
    },
  });
}, process.env.NOTIFICATIONS_INTERVAL ?? 60_000);

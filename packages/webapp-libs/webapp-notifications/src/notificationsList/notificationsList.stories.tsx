import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { append } from 'ramda';

import { NotificationTypes } from '../notifications.types';
import { fillNotificationsListQuery, notificationFactory } from '../tests/factories';
import { withProviders } from '../utils/storybook';
import { NotificationsList, NotificationsListProps } from './notificationsList.component';

const Template: StoryFn<NotificationsListProps> = (args: NotificationsListProps) => {
  return <NotificationsList {...args} />;
};

const meta: Meta<typeof NotificationsList> = {
  title: 'Notifications/NotificationsList',
  component: NotificationsList,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      apolloMocks: append(
        fillNotificationsListQuery([
          notificationFactory({
            type: NotificationTypes.CRUD_ITEM_CREATED,
            data: {
              id: '1',
              user: 'example@example.com',
              name: 'Lorem ipsum',
            },
          }),
          notificationFactory({
            readAt: new Date().toISOString(),
            type: NotificationTypes.CRUD_ITEM_UPDATED,
            data: {
              id: '1',
              user: 'example@example.com',
              name: 'Lorem ipsum',
            },
          }),
        ])
      ),
    }),
  ],
};

export const Empty: StoryObj<typeof meta> = {
  render: Template,

  decorators: [
    withProviders({
      apolloMocks: append(fillNotificationsListQuery([])),
    }),
  ],
};

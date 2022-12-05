import { Story } from '@storybook/react';
import { withProviders } from '../../../utils/storybook';
import { fillNotificationsListQuery, notificationFactory } from '../../../../mocks/factories';
import { NotificationTypes } from '../notifications.types';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';
import { NotificationsList, NotificationsListProps } from './notificationsList.component';

const Template: Story<NotificationsListProps> = (args: NotificationsListProps) => {
  return <NotificationsList {...args} />;
};

export default {
  title: 'Shared/Notifications/NotificationsList',
  component: NotificationsList,
};

export const Default = Template.bind({});
Default.args = { isOpen: true, listQueryRef: {} as any };
Default.decorators = [
  withProviders({
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env);
      fillNotificationsListQuery(env, [
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
      ]);
    },
  }),
];

export const Empty = Template.bind({});
Empty.args = { isOpen: true, listQueryRef: {} as any };
Empty.decorators = [
  withProviders({
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env);
      fillNotificationsListQuery(env, []);
    },
  }),
];

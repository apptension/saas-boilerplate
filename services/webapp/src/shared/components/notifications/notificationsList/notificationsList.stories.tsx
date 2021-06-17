import React from 'react';
import { Story } from '@storybook/react';

import { NotificationsList, NotificationsListProps } from './notificationsList.component';

const Template: Story<NotificationsListProps> = (args) => {
  return <NotificationsList {...args} />;
};

export default {
  title: 'Shared/Notifications/NotificationsList',
  component: NotificationsList,
};

export const Default = Template.bind({});
Default.args = { isOpen: true };

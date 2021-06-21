import React from 'react';
import styled from 'styled-components';
import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { Notification, NotificationProps } from './notification.component';
import { mockedNotificationProps } from './notification.fixtures';

const Wrapper = styled.div`
  max-width: 320px;
`;

const Template: Story<NotificationProps> = (args) => {
  return (
    <Wrapper>
      <Notification {...args} />
    </Wrapper>
  );
};

export default {
  title: 'Shared/Notifications/Notification',
  component: Notification,
};

export const Default = Template.bind({});
Default.args = {
  ...mockedNotificationProps,
  title: 'Item has been added!',
  content: 'Lorem ipsum item has been added to somewhere',
  onClick: action('click action'),
};

export const Read = Template.bind({});
Read.args = {
  ...Default.args,
  readAt: '2021-06-17T16:45:33',
};

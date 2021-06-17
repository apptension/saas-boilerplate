import React from 'react';
import styled from 'styled-components';
import { Story } from '@storybook/react';

import { Notification, NotificationProps } from './notification.component';

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
Default.args = { children: 'text' };

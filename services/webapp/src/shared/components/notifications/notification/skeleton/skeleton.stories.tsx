import React from 'react';
import { Story } from '@storybook/react';
import { Skeleton } from './skeleton.component';

const Template: Story = (args) => {
  return <Skeleton {...args} />;
};

export default {
  title: 'Shared/Notifications/Notification/Skeleton',
  component: Skeleton,
};

export const Default = Template.bind({});

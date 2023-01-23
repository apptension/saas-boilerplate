import { Story } from '@storybook/react';
import { Skeleton } from './skeleton.component';

const Template: Story = () => {
  return <Skeleton />;
};

export default {
  title: 'Shared/Notifications/Notification/Skeleton',
  component: Skeleton,
};

export const Default = Template.bind({});

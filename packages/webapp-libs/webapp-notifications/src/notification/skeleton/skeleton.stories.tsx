import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { Skeleton } from './skeleton.component';

const Template: StoryFn = () => {
  return <Skeleton />;
};

const meta: Meta = {
  title: 'Shared/Notifications/Notification/Skeleton',
  component: Skeleton,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
};

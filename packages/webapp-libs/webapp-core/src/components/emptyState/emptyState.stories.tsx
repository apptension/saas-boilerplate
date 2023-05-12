import { StoryFn } from '@storybook/react';

import { EmptyState, EmptyStateProps } from './emptyState.component';

const Template: StoryFn<EmptyStateProps> = (args: EmptyStateProps) => {
  return <EmptyState {...args} />;
};

export default {
  title: 'Shared/EmptyState',
  component: EmptyState,
};

export const Default = {
  render: Template,
  args: { children: 'No resources' },
};

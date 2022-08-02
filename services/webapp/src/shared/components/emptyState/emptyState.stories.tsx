import { Story } from '@storybook/react';
import { EmptyState, EmptyStateProps } from './emptyState.component';

const Template: Story<EmptyStateProps> = (args: EmptyStateProps) => {
  return <EmptyState {...args} />;
};

export default {
  title: 'Shared/EmptyState',
  component: EmptyState,
};

export const Default = Template.bind({});
Default.args = { children: 'No resources' };

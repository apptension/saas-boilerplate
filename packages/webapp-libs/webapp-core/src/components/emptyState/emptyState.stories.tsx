import { Meta, StoryObj } from '@storybook/react';

import { EmptyState } from './emptyState.component';

type Story = StoryObj<typeof EmptyState>;

const meta: Meta<typeof EmptyState> = {
  title: 'Core/EmptyState',
  component: EmptyState,
};

export default meta;

export const Default: Story = {
  args: { children: 'No resources' },
};

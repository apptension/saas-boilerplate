import { Meta, StoryObj } from '@storybook/react';

import { Pagination } from './pagination.component';

type Story = StoryObj<typeof Pagination>;

const meta: Meta<typeof Pagination> = {
  title: 'Core/Pagination',
  component: Pagination,
};

export default meta;

export const Default: Story = {
  args: { hasNext: false, hasPrevious: false },
};

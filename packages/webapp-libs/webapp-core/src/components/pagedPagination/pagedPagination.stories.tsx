import { Meta, StoryObj } from '@storybook/react';

import { PagedPagination } from './pagedPagination.component';

type Story = StoryObj<typeof PagedPagination>;

const meta: Meta<typeof PagedPagination> = {
  title: 'Core/PagedPagination',
  component: PagedPagination,
};

export default meta;

export const Default: Story = {
  args: {
    around: [
      { cursor: 'cursor1', page: 1, isCurrent: true },
      { cursor: 'cursor2', page: 2, isCurrent: false },
      { cursor: 'cursor3', page: 3, isCurrent: false },
    ],
    first: null,
    last: { cursor: 'last', page: 10, isCurrent: false },
    next: { cursor: 'next', page: 4, isCurrent: false },
    previous: { cursor: 'prev', page: 2, isCurrent: false },
    onPageClick: () => ({}),
  },
};

import { Meta, StoryObj } from '@storybook/react';

import { TableFooter } from './tableFooter.component';

type Story = StoryObj<typeof TableFooter>;

const meta: Meta<typeof TableFooter> = {
  title: 'Core/Table/TableFooter',
  component: TableFooter,
};

export default meta;

export const Default: Story = {
  args: {
    pageSize: 10,
    onPageSizeChange: () => ({}),
    pagination: {
      around: [
        { cursor: '1', isCurrent: true, page: 1 },
        { cursor: '2', isCurrent: false, page: 2 },
        { cursor: '3', isCurrent: false, page: 3 },
      ],
      first: null,
      last: null,
      next: { cursor: '3', isCurrent: false, page: 2 },
      previous: null,
      onPageClick: () => ({}),
    },
  },
};

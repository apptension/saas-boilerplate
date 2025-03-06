import { Meta, StoryObj } from '@storybook/react';

import { TABLE_FILTER_TYPES } from '../table.types';
import { TableToolbar } from './tableToolbar.component';

type Story = StoryObj<typeof TableToolbar>;

const meta: Meta<typeof TableToolbar> = {
  title: 'Core/Table/TableToolbar',
  component: TableToolbar,
};

export default meta;

export const WithSearch: Story = {
  args: {
    config: {
      enableSearch: true,
    },
    onUpdate: () => ({}),
    onReset: () => ({}),
    values: {},
  },
};

export const WithFilters: Story = {
  args: {
    config: {
      enableSearch: false,
      filters: [
        {
          id: 'status',
          label: 'Status',
          type: TABLE_FILTER_TYPES.BOOLEAN,
          options: [
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ],
        },
        {
          id: 'category',
          label: 'Category',
          type: TABLE_FILTER_TYPES.SELECT,
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
        },
      ],
    },
    values: {
      status: 'true',
      category: ['option1'],
    },
    onUpdate: () => ({}),
    onReset: () => ({}),
  },
};

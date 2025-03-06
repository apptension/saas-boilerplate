import { Meta, StoryObj } from '@storybook/react';

import { TABLE_FILTER_TYPES } from '../table.types';
import { TableToolbarFacetedFilter } from './tableToolbarFacetedFilter.component';

type Story = StoryObj<typeof TableToolbarFacetedFilter>;

const meta: Meta<typeof TableToolbarFacetedFilter> = {
  title: 'Core/Table/TableToolbarFacetedFilter',
  component: TableToolbarFacetedFilter,
};

export default meta;

export const Boolean: Story = {
  args: {
    value: 'true',
    config: {
      id: 'status',
      label: 'Status',
      type: TABLE_FILTER_TYPES.BOOLEAN,
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
    onChange: () => ({}),
  },
};

export const Select: Story = {
  args: {
    value: ['option1'],
    config: {
      id: 'category',
      label: 'Category',
      type: TABLE_FILTER_TYPES.SELECT,
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
    },
    onChange: () => ({}),
  },
};

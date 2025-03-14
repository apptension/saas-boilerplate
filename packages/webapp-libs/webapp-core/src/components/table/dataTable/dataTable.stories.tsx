import { Meta, StoryObj } from '@storybook/react';
import { ColumnDef } from '@tanstack/react-table';

import { DataTable } from './dataTable.component';

type Story = StoryObj<typeof DataTable>;

const meta: Meta<typeof DataTable> = {
  title: 'Core/Table/DataTable',
  component: DataTable,
};

export default meta;

const columns: ColumnDef<unknown>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'age',
    header: 'Age',
  },
];

const data = [
  { id: 1, name: 'John Doe', age: 28 },
  { id: 2, name: 'Jane Smith', age: 34 },
  { id: 3, name: 'Sam Johnson', age: 45 },
];

export const Default: Story = {
  args: {
    columns,
    data,
    isLoading: false,
  },
};

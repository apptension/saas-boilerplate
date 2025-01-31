import { Meta, StoryObj } from '@storybook/react';

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../table';

type Story = StoryObj<typeof Table>;

const meta: Meta<typeof Table> = {
  title: 'Core/UI/Table',
  component: Table,
};

export default meta;

export const Default: Story = {
  args: {
    children: (
      <>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">INV001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell className="text-right">$250.00</TableCell>
          </TableRow>
        </TableBody>
      </>
    ),
  },
};

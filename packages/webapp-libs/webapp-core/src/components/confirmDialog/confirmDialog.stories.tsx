import { Meta, StoryObj } from '@storybook/react';

import { ConfirmDialog } from './confirmDialog.component';

type Story = StoryObj<typeof ConfirmDialog>;

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Core/ConfirmDialog',
  component: ConfirmDialog,
};

export default meta;

export const Default: Story = {
  args: {
    title: 'Title',
    description: 'Description',
    onCancel: () => ({}),
    onContinue: () => ({}),
    children: <button>trigger</button>,
  },
};

export const Destructive: Story = {
  args: {
    ...Default.args,
    variant: 'destructive',
  },
};

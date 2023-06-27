import { Meta, StoryObj } from '@storybook/react';

import { Dialog } from './dialog.component';

type Story = StoryObj<typeof Dialog>;

const meta: Meta<typeof Dialog> = {
  title: 'Core/Dialog',
  component: Dialog,
};

export default meta;

export const Open: Story = {
  args: {
    open: true,
    children: <>Dialog content</>,
  },
};

export const CustomHeader: Story = {
  args: {
    open: true,
    children: <>Dialog content</>,
  },
};

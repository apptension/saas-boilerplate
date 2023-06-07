import { Meta, StoryObj } from '@storybook/react';

import { Dialog } from './dialog.component';

type Story = StoryObj<typeof Dialog>;

const meta: Meta<typeof Dialog> = {
  title: 'Shared/Dialog',
  component: Dialog,
};

export default meta;

export const Open: Story = {
  args: {
    isOpen: true,
    children: <>Dialog content</>,
  },
};

export const CustomHeader: Story = {
  args: {
    isOpen: true,
    header: <>Custom header</>,
    children: <>Dialog content</>,
  },
};

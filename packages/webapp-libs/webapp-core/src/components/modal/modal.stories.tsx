import { Meta, StoryObj } from '@storybook/react';

import { Modal } from './modal.component';

type Story = StoryObj<typeof Modal>;

const meta: Meta<typeof Modal> = {
  title: 'Shared/Modal',
  component: Modal,
};

export default meta;

export const Open: Story = {
  args: {
    isOpen: true,
    children: <>Modal content</>,
  },
};

export const CustomHeader: Story = {
  args: {
    isOpen: true,
    header: <>Custom header</>,
    children: <>Modal content</>,
  },
};

import { Meta, StoryObj } from '@storybook/react';

import { Card } from './cards.component';

type Story = StoryObj<typeof Card>;

const meta: Meta<typeof Card> = {
  title: 'Shared/Card',
  component: Card,
};

export default meta;

export const Open: Story = {
  args: {
    children: <>Card content</>,
  },
};

export const CustomHeader: Story = {
  args: {
    children: <>Card content</>,
  },
};

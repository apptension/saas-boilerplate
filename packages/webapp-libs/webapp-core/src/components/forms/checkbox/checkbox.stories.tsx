import { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from './checkbox.component';

type Story = StoryObj<typeof Checkbox>;

const meta: Meta<typeof Checkbox> = {
  title: 'Core/Forms/Checkbox',
  component: Checkbox,
};

export default meta;

export const WithLabel: Story = {
  args: { label: 'Checkbox' },
};

export const Checked: Story = {
  args: { label: 'Checkbox', checked: true },
};

export const NoLabel: Story = {
  args: {},
};

export const Invalid: Story = {
  args: { label: 'Checkbox', error: 'Invalid value' },
};

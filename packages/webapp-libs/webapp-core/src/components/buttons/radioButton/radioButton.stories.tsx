import { Meta, StoryObj } from '@storybook/react';

import { RadioButton } from './radioButton.component';

type Story = StoryObj<typeof RadioButton>;

const meta: Meta<typeof RadioButton> = {
  title: 'Core/Forms/RadioButton',
  component: RadioButton,
};

export default meta;

export const Default: Story = {
  args: {
    children: 'Value',
  },
};

export const Checked: Story = {
  args: {
    ...Default.args,
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    ...Default.args,
    disabled: true,
    checked: true,
  },
};

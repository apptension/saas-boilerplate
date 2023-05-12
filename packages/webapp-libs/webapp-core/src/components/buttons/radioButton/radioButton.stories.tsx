import { StoryFn } from '@storybook/react';

import { RadioButton, RadioButtonProps } from './radioButton.component';

const Template: StoryFn<RadioButtonProps> = (args: RadioButtonProps) => {
  return <RadioButton {...args} />;
};

export default {
  title: 'Core/Forms/RadioButton',
  component: RadioButton,
};

export const Default = {
  render: Template,

  args: {
    children: 'Value',
  },
};

export const Checked = {
  render: Template,

  args: {
    ...Default.args,
    checked: true,
  },
};

export const Disabled = {
  render: Template,

  args: {
    ...Default.args,
    disabled: true,
  },
};

export const DisabledChecked = {
  render: Template,

  args: {
    ...Default.args,
    disabled: true,
    checked: true,
  },
};

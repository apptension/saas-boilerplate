import { Story } from '@storybook/react';
import { RadioButton, RadioButtonProps } from './radioButton.component';

const Template: Story<RadioButtonProps> = (args) => {
  return <RadioButton {...args} />;
};

export default {
  title: 'Shared/RadioButton',
  component: RadioButton,
};

export const Default = Template.bind({});
Default.args = {
  children: 'Value',
};

export const Checked = Template.bind({});
Checked.args = {
  ...Default.args,
  checked: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  disabled: true,
};

export const DisabledChecked = Template.bind({});
DisabledChecked.args = {
  ...Default.args,
  disabled: true,
  checked: true,
};

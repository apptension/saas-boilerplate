import React from 'react';
import { Story } from '@storybook/react';

import { Checkbox, CheckboxProps } from './checkbox.component';

const Template: Story<CheckboxProps> = (args) => {
  return <Checkbox {...args} />;
};

export default {
  title: 'Shared/Checkbox',
  component: Checkbox,
};

export const WithLabel = Template.bind({});
WithLabel.args = { label: 'Checkbox' };

export const Checked = Template.bind({});
Checked.args = { label: 'Checkbox', checked: true };

export const SemiChecked = Template.bind({});
SemiChecked.args = { label: 'Checkbox', semiChecked: true, checked: true };

export const NoLabel = Template.bind({});
NoLabel.args = {};

export const Invalid = Template.bind({});
Invalid.args = { label: 'Checkbox', error: 'Invalid value' };

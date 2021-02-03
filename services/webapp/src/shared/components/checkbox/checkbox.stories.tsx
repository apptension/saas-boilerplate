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

export const Default = Template.bind({});
Default.args = { label: 'Checkbox' };

export const Invalid = Template.bind({});
Invalid.args = { label: 'Checkbox', error: 'Invalid value' };

import React from 'react';
import { Story } from '@storybook/react';

import { Input, InputProps } from './input.component';

const Template: Story<InputProps> = (args) => {
  return <Input {...args} />;
};

export default {
  title: 'Shared/Input',
  component: Input,
};

export const Default = Template.bind({});
Default.args = { type: 'text' };

export const Invalid = Template.bind({});
Invalid.args = { type: 'text', error: 'Invalid value' };

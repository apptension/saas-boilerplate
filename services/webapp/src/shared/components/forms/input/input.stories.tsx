import { Story } from '@storybook/react';
import { Input, InputProps } from './input.component';

const Template: Story<InputProps> = (args: InputProps) => {
  return <Input {...args} />;
};

export default {
  title: 'Shared/Forms/Input',
  component: Input,
};

export const Default = Template.bind({});
Default.args = { type: 'text' };

export const Labeled = Template.bind({});
Labeled.args = { type: 'text', label: 'Enter your name here' };

export const Required = Template.bind({});
Required.args = { type: 'text', label: 'Enter your name here', required: true };

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = { type: 'text', placeholder: 'Enter your name here' };

export const Invalid = Template.bind({});
Invalid.args = { type: 'text', error: 'Invalid value', label: 'Enter your name here' };

export const Disabled = Template.bind({});
Disabled.args = { type: 'text', disabled: true, placeholder: 'This is disabled', label: 'Enter your name here' };

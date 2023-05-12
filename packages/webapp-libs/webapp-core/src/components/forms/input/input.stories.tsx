import { StoryFn } from '@storybook/react';
import { Input, InputProps } from './input.component';

const Template: StoryFn<InputProps> = (args: InputProps) => {
  return <Input {...args} />;
};

export default {
  title: 'Core/Forms/Input',
  component: Input,
};

export const Default = {
  render: Template,
  args: { type: 'text' },
};

export const Labeled = {
  render: Template,
  args: { type: 'text', label: 'Enter your name here' },
};

export const Required = {
  render: Template,
  args: { type: 'text', label: 'Enter your name here', required: true },
};

export const WithPlaceholder = {
  render: Template,
  args: { type: 'text', placeholder: 'Enter your name here' },
};

export const Invalid = {
  render: Template,
  args: { type: 'text', error: 'Invalid value', label: 'Enter your name here' },
};

export const Disabled = {
  render: Template,
  args: {
    type: 'text',
    disabled: true,
    placeholder: 'This is disabled',
    label: 'Enter your name here',
  },
};

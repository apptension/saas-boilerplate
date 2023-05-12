import { StoryFn } from '@storybook/react';
import { Checkbox, CheckboxProps } from './checkbox.component';

const Template: StoryFn<CheckboxProps> = (args: CheckboxProps) => {
  return <Checkbox {...args} />;
};

export default {
  title: 'Core/Forms/Checkbox',
  component: Checkbox,
};

export const WithLabel = {
  render: Template,
  args: { label: 'Checkbox' },
};

export const Checked = {
  render: Template,
  args: { label: 'Checkbox', checked: true },
};

export const SemiChecked = {
  render: Template,
  args: { label: 'Checkbox', semiChecked: true, checked: true },
};

export const NoLabel = {
  render: Template,
  args: {},
};

export const Invalid = {
  render: Template,
  args: { label: 'Checkbox', error: 'Invalid value' },
};

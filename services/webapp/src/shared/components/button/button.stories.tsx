import React from 'react';
import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { Button, ButtonProps } from './button.component';
import { ButtonVariant } from './button.types';

const Template: Story<ButtonProps> = (args) => <Button {...args} />;

export default {
  title: 'Shared/Button',
  component: Button,
};

export const Primary = Template.bind({});
Primary.args = {
  children: 'Press me',
  onClick: action('Clicked me'),
  disabled: false,
  variant: ButtonVariant.PRIMARY,
};

export const PrimaryDisabled = Template.bind({});
PrimaryDisabled.args = {
  ...Primary.args,
  disabled: true,
};

export const Secondary = Template.bind({});
Secondary.args = {
  ...Primary.args,
  variant: ButtonVariant.SECONDARY,
};

export const SecondaryDisabled = Template.bind({});
Secondary.args = {
  ...Secondary.args,
  disabled: true,
};

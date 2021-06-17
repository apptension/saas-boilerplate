import React from 'react';
import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { FacebookIcon } from '../../../images/icons';
import { Button, ButtonProps } from './button.component';
import { ButtonVariant } from './button.types';

const Template: Story<ButtonProps> = (args) => <Button {...args} />;

export default {
  title: 'Shared/Button',
  component: Button,
};

const defaultArgs = {
  children: 'Press me',
  onClick: action('Clicked me'),
  disabled: false,
  variant: ButtonVariant.PRIMARY,
};

export const Primary = Template.bind({});
Primary.args = { ...defaultArgs };

export const PrimaryWithFixedWidth = Template.bind({});
PrimaryWithFixedWidth.args = {
  ...Primary.args,
  fixedWidth: true,
};

export const PrimaryDisabled = Template.bind({});
PrimaryDisabled.args = {
  ...Primary.args,
  disabled: true,
};

export const Secondary = Template.bind({});
Secondary.args = {
  ...defaultArgs,
  variant: ButtonVariant.SECONDARY,
};

export const SecondaryWithIcon = Template.bind({});
SecondaryWithIcon.args = {
  ...Secondary.args,
  icon: <FacebookIcon />,
};

export const SecondaryDisabled = Template.bind({});
SecondaryDisabled.args = {
  ...Secondary.args,
  disabled: true,
};

export const Flat = Template.bind({});
Flat.args = {
  ...defaultArgs,
  variant: ButtonVariant.FLAT,
};

export const Raw = Template.bind({});
Raw.args = {
  ...defaultArgs,
  variant: ButtonVariant.RAW,
};

export const RawWithIcon = Template.bind({});
RawWithIcon.args = {
  ...Raw.args,
  icon: <FacebookIcon />,
};

export const RawDisabled = Template.bind({});
RawDisabled.args = {
  ...Raw.args,
  disabled: true,
};

export const Round = Template.bind({});
Round.args = {
  ...defaultArgs,
  variant: ButtonVariant.ROUND,
  children: <FacebookIcon />,
};

export const RoundDisabled = Template.bind({});
RoundDisabled.args = {
  ...Round.args,
  disabled: true,
};

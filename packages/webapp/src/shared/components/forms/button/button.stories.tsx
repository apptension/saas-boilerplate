import { Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { FacebookIcon } from '../../../../images/icons';
import { Button, ButtonProps } from './button.component';
import { ButtonColor, ButtonSize, ButtonVariant } from './button.types';

const Template: Story<ButtonProps> = (args: ButtonProps) => <Button {...args} />;

export default {
  title: 'Shared/Forms/Button',
  component: Button,
};

export const Primary = Template.bind({});
Primary.args = {
  children: 'Press me',
  onClick: action('Clicked me'),
  disabled: false,
  variant: ButtonVariant.PRIMARY,
  color: ButtonColor.PRIMARY,
  size: ButtonSize.NORMAL,
};

export const PrimaryCustomColor = Template.bind({});
PrimaryCustomColor.args = { ...Primary.args, color: '#3cd48d' };

export const PrimaryCustomColorDark = Template.bind({});
PrimaryCustomColorDark.args = { ...Primary.args, color: '#34403b' };

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

export const PrimarySmall = Template.bind({});
PrimarySmall.args = {
  ...Primary.args,
  size: ButtonSize.SMALL,
};

export const Secondary = Template.bind({});
Secondary.args = {
  ...Primary.args,
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
  ...Primary.args,
  variant: ButtonVariant.FLAT,
};

export const FlatDisabled = Template.bind({});
FlatDisabled.args = {
  ...Flat.args,
  disabled: true,
};

export const Raw = Template.bind({});
Raw.args = {
  ...Primary.args,
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
  ...Primary.args,
  variant: ButtonVariant.ROUND,
  children: <FacebookIcon />,
};

export const RoundDisabled = Template.bind({});
RoundDisabled.args = {
  ...Round.args,
  disabled: true,
};

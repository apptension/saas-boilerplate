import editIcon from '@iconify-icons/ion/pencil-sharp';
import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';

import { Icon } from '../../icons';
import { Button } from './button.component';
import { ButtonColor, ButtonSize, ButtonVariant } from './button.types';

type Story = StoryObj<typeof Button>;

const meta: Meta<typeof Button> = {
  title: 'Core/Forms/Button',
  component: Button,
};

export default meta;

export const Primary: Story = {
  args: {
    children: 'Press me',
    onClick: action('Clicked me'),
    disabled: false,
    variant: ButtonVariant.PRIMARY,
    color: ButtonColor.PRIMARY,
    size: ButtonSize.NORMAL,
  },
};

export const PrimaryCustomColor: Story = {
  args: { ...Primary.args, color: '#3cd48d' },
};

export const PrimaryCustomColorDark: Story = {
  args: { ...Primary.args, color: '#34403b' },
};

export const PrimaryWithFixedWidth: Story = {
  args: {
    ...Primary.args,
    fixedWidth: true,
  },
};

export const PrimaryDisabled: Story = {
  args: {
    ...Primary.args,
    disabled: true,
  },
};

export const PrimarySmall: Story = {
  args: {
    ...Primary.args,
    size: ButtonSize.SMALL,
  },
};

export const Secondary: Story = {
  args: {
    ...Primary.args,
    variant: ButtonVariant.SECONDARY,
  },
};

export const SecondaryWithIcon: Story = {
  args: {
    ...Secondary.args,
    icon: <Icon icon={editIcon} size={24} />,
  },
};

export const SecondaryDisabled: Story = {
  args: {
    ...Secondary.args,
    disabled: true,
  },
};

export const Flat: Story = {
  args: {
    ...Primary.args,
    variant: ButtonVariant.FLAT,
  },
};

export const FlatDisabled: Story = {
  args: {
    ...Flat.args,
    disabled: true,
  },
};

export const Raw: Story = {
  args: {
    ...Primary.args,
    variant: ButtonVariant.RAW,
  },
};

export const RawWithIcon: Story = {
  args: {
    ...Raw.args,
    icon: <Icon icon={editIcon} size={24} />,
  },
};

export const RawDisabled: Story = {
  args: {
    ...Raw.args,
    disabled: true,
  },
};

export const Round: Story = {
  args: {
    ...Primary.args,
    variant: ButtonVariant.ROUND,
    children: <Icon icon={editIcon} size={24} />,
  },
};

export const RoundDisabled: Story = {
  args: {
    ...Round.args,
    disabled: true,
  },
};

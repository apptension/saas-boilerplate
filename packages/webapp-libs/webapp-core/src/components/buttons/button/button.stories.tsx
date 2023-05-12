import editIcon from '@iconify-icons/ion/pencil-sharp';
import { action } from '@storybook/addon-actions';

import { Icon } from '../../icons';
import { Button } from './button.component';
import { ButtonColor, ButtonSize, ButtonVariant } from './button.types';

export default {
  title: 'Core/Forms/Button',
  component: Button,
};

export const Primary = {
  args: {
    children: 'Press me',
    onClick: action('Clicked me'),
    disabled: false,
    variant: ButtonVariant.PRIMARY,
    color: ButtonColor.PRIMARY,
    size: ButtonSize.NORMAL,
  },
};

export const PrimaryCustomColor = {
  args: { ...Primary.args, color: '#3cd48d' },
};

export const PrimaryCustomColorDark = {
  args: { ...Primary.args, color: '#34403b' },
};

export const PrimaryWithFixedWidth = {
  args: {
    ...Primary.args,
    fixedWidth: true,
  },
};

export const PrimaryDisabled = {
  args: {
    ...Primary.args,
    disabled: true,
  },
};

export const PrimarySmall = {
  args: {
    ...Primary.args,
    size: ButtonSize.SMALL,
  },
};

export const Secondary = {
  args: {
    ...Primary.args,
    variant: ButtonVariant.SECONDARY,
  },
};

export const SecondaryWithIcon = {
  args: {
    ...Secondary.args,
    icon: <Icon icon={editIcon} size={24} />,
  },
};

export const SecondaryDisabled = {
  args: {
    ...Secondary.args,
    disabled: true,
  },
};

export const Flat = {
  args: {
    ...Primary.args,
    variant: ButtonVariant.FLAT,
  },
};

export const FlatDisabled = {
  args: {
    ...Flat.args,
    disabled: true,
  },
};

export const Raw = {
  args: {
    ...Primary.args,
    variant: ButtonVariant.RAW,
  },
};

export const RawWithIcon = {
  args: {
    ...Raw.args,
    icon: <Icon icon={editIcon} size={24} />,
  },
};

export const RawDisabled = {
  args: {
    ...Raw.args,
    disabled: true,
  },
};

export const Round = {
  args: {
    ...Primary.args,
    variant: ButtonVariant.ROUND,
    children: <Icon icon={editIcon} size={24} />,
  },
};

export const RoundDisabled = {
  args: {
    ...Round.args,
    disabled: true,
  },
};

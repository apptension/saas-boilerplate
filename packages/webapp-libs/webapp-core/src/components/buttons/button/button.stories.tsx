import editIcon from '@iconify-icons/ion/pencil-sharp';
import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';

import { Icon } from '../../icons';
import { Button } from './button.component';

type Story = StoryObj<typeof Button>;

const meta: Meta<typeof Button> = {
  title: 'Core/Button',
  component: Button,
};

export default meta;

export const Primary: Story = {
  args: {
    children: 'Press me',
    onClick: action('Clicked me'),
    disabled: false,
    variant: 'default',
    size: 'default',
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
    size: 'sm',
  },
};

export const Secondary: Story = {
  args: {
    ...Primary.args,
    variant: 'secondary',
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

export const Destructive: Story = {
  args: {
    ...Primary.args,
    variant: 'destructive',
  },
};

export const DestructiveDisabled: Story = {
  args: {
    ...Destructive.args,
    disabled: true,
  },
};

export const Outline: Story = {
  args: {
    ...Primary.args,
    variant: 'outline',
  },
};

export const OutlineDisabled: Story = {
  args: {
    ...Outline.args,
    disabled: true,
  },
};

export const Ghost: Story = {
  args: {
    ...Primary.args,
    variant: 'ghost',
  },
};

export const GhostDisabled: Story = {
  args: {
    ...Ghost.args,
    disabled: true,
  },
};

export const Link: Story = {
  args: {
    ...Primary.args,
    variant: 'link',
  },
};

export const LinkDisabled: Story = {
  args: {
    ...Link.args,
    disabled: true,
  },
};

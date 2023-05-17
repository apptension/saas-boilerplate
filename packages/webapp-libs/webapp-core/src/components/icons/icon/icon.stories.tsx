import closeIcon from '@iconify-icons/ion/close-outline';
import { Meta, StoryObj } from '@storybook/react';

import { Icon } from './icon.component';

type Story = StoryObj<typeof Icon>;

const meta: Meta<typeof Icon> = {
  title: 'Core/Icon',
  component: Icon,
};

export default meta;

export const Close: Story = {
  args: { icon: closeIcon },
};

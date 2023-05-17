import { Meta, StoryObj } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { BackButton } from './backButton.component';

type Story = StoryObj<typeof BackButton>;

const meta: Meta<typeof BackButton> = {
  title: 'Core/BackButton',
  component: BackButton,
  decorators: [withProviders()],
};

export default meta;

export const Primary: Story = {
  args: { to: '#' },
};

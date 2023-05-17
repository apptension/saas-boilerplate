import { Meta, StoryObj } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { Dropzone } from './dropzone.component';

type Story = StoryObj<typeof Dropzone>;

const meta: Meta<typeof Dropzone> = {
  title: 'Core/Forms/Dropzone',
  component: Dropzone,
  decorators: [withProviders()],
};

export default meta;

export const Default: Story = {
  args: {},
};

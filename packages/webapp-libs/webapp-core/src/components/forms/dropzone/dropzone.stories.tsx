import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { Dropzone, DropzoneProps } from './dropzone.component';

const Template: StoryFn<DropzoneProps> = (args: DropzoneProps) => {
  return <Dropzone {...args} />;
};

export default {
  title: 'Core/Forms/Dropzone',
  component: Dropzone,
  decorators: [withProviders()],
};

export const Default = {
  render: Template,
  args: {},
};

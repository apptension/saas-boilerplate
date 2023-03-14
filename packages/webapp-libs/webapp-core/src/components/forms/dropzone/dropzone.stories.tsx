import { Story } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { Dropzone, DropzoneProps } from './dropzone.component';

const Template: Story<DropzoneProps> = (args: DropzoneProps) => {
  return <Dropzone {...args} />;
};

export default {
  title: 'Core/Forms/Dropzone',
  component: Dropzone,
  decorators: [withProviders()],
};

export const Default = Template.bind({});
Default.args = {};

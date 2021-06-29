import { Story } from '@storybook/react';
import { Dropzone, DropzoneProps } from './dropzone.component';

const Template: Story<DropzoneProps> = (args) => {
  return <Dropzone {...args} />;
};

export default {
  title: 'Shared/Dropzone',
  component: Dropzone,
};

export const Default = Template.bind({});
Default.args = {};

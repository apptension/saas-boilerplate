import { Story } from '@storybook/react';
import { Dropzone, DropzoneProps } from './dropzone.component';

const Template: Story<DropzoneProps> = (args: DropzoneProps) => {
  return <Dropzone {...args} />;
};

export default {
  title: 'Shared/Forms/Dropzone',
  component: Dropzone,
};

export const Default = Template.bind({});
Default.args = {};

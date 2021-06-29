import { Story } from '@storybook/react';
import { Documents } from './documents.component';

const Template: Story = (args) => {
  return <Documents {...args} />;
};

export default {
  title: 'Routes/Documents',
  component: Documents,
};

export const Default = Template.bind({});

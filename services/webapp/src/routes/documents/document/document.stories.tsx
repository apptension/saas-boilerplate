import { Story } from '@storybook/react';
import { Document, DocumentProps } from './document.component';

const Template: Story<DocumentProps> = (args) => {
  return <Document {...args} />;
};

export default {
  title: 'Routes/Documents/Document',
  component: Document,
};

export const Default = Template.bind({});
Default.args = { children: 'text' };

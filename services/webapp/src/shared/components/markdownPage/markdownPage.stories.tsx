import { Story } from '@storybook/react';
import { MarkdownPage, MarkdownPageProps } from './markdownPage.component';

const markdown = `
## Hello world

1. item
2. another item
3. and one more

- unordered item
- and second one
`;

const Template: Story<MarkdownPageProps> = (args: MarkdownPageProps) => {
  return <MarkdownPage {...args} />;
};

export default {
  title: 'Shared/MarkdownPage',
  component: MarkdownPage,
};

export const Default = Template.bind({});
Default.args = { markdown };

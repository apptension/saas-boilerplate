import { Story } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
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
  title: 'Core/MarkdownPage',
  component: MarkdownPage,
  decorators: [withProviders()],
};

export const Default = Template.bind({});
Default.args = { markdown };

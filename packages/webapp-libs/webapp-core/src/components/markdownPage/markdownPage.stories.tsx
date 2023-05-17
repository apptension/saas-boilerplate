import { Meta, StoryObj } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { MarkdownPage } from './markdownPage.component';

type Story = StoryObj<typeof MarkdownPage>;

const markdown = `
## Hello world

1. item
2. another item
3. and one more

- unordered item
- and second one
`;

const meta: Meta<typeof MarkdownPage> = {
  title: 'Core/MarkdownPage',
  component: MarkdownPage,
  decorators: [withProviders()],
};

export default meta;

export const Default: Story = {
  args: { markdown },
};

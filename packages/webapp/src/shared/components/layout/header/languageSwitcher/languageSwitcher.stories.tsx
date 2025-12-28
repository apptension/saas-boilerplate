import { Meta, StoryObj } from '@storybook/react';

import { LanguageSwitcher } from './languageSwitcher.component';

const meta: Meta<typeof LanguageSwitcher> = {
  title: 'Shared/Layout/Header/LanguageSwitcher',
  component: LanguageSwitcher,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="flex h-16 items-center justify-center bg-background p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LanguageSwitcher>;

export const Default: Story = {};

export const WithCustomClassName: Story = {
  args: {
    className: 'border rounded-md p-1',
  },
};


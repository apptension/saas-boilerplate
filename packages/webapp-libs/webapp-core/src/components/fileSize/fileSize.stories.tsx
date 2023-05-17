import { Meta, StoryObj } from '@storybook/react';

import { FileSize } from './fileSize.component';

type Story = StoryObj<typeof FileSize>;

const meta: Meta<typeof FileSize> = {
  title: 'Core/FileSize',
  component: FileSize,
};

export default meta;

export const Bytes: Story = {
  args: { size: 102 },
};

export const Kilobytes: Story = {
  args: { size: 2048 },
};

export const Decimal: Story = {
  args: { size: 1300 },
};

export const NoDecimal: Story = {
  args: { size: 1300, decimals: 0 },
};

import { Meta, StoryObj } from '@storybook/react';

import { FormattedDate } from './formattedDate.component';

type Story = StoryObj<typeof FormattedDate>;

const meta: Meta<typeof FormattedDate> = {
  title: 'Core/DateTime/FormattedDate',
  component: FormattedDate,
};

export default meta;

export const Default: Story = {
  args: { value: new Date() },
};

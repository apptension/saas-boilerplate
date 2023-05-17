import { Meta, StoryObj } from '@storybook/react';

import { RelativeDate } from './relativeDate.component';
import { DAY, dateMinuteAgo, nowSub } from './relativeDate.fixtures';

type Story = StoryObj<typeof RelativeDate>;

const meta: Meta<typeof RelativeDate> = {
  title: 'Core/DateTime/RelativeDate',
  component: RelativeDate,
};

export default meta;

export const Default: Story = {
  args: { date: new Date() },
};

export const MinuteAgo: Story = {
  args: { date: dateMinuteAgo() },
};

export const WeekAgo: Story = {
  args: { date: nowSub(DAY * 7) },
};

export const YearAgo: Story = {
  args: { date: nowSub(DAY * 365) },
};

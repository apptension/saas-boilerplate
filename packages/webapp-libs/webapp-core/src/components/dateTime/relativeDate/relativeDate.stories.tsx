import { StoryFn } from '@storybook/react';

import { RelativeDate, RelativeDateProps } from './relativeDate.component';
import { DAY, dateMinuteAgo, nowSub } from './relativeDate.fixtures';

const Template: StoryFn<RelativeDateProps> = (args: RelativeDateProps) => {
  return <RelativeDate {...args} />;
};

export default {
  title: 'Core/DateTime/RelativeDate',
  component: RelativeDate,
};

export const Default = {
  render: Template,
  args: { date: new Date() },
};

export const MinuteAgo = {
  render: Template,
  args: { date: dateMinuteAgo() },
};

export const WeekAgo = {
  render: Template,
  args: { date: nowSub(DAY * 7) },
};

export const YearAgo = {
  render: Template,
  args: { date: nowSub(DAY * 365) },
};

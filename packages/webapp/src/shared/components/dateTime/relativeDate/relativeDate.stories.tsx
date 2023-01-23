import { Story } from '@storybook/react';
import { RelativeDate, RelativeDateProps } from './relativeDate.component';
import { dateMinuteAgo, DAY, nowSub } from './relativeDate.fixtures';

const Template: Story<RelativeDateProps> = (args: RelativeDateProps) => {
  return <RelativeDate {...args} />;
};

export default {
  title: 'Shared/DateTime/RelativeDate',
  component: RelativeDate,
};

export const Default = Template.bind({});
Default.args = { date: new Date() };

export const MinuteAgo = Template.bind({});
MinuteAgo.args = { date: dateMinuteAgo() };

export const WeekAgo = Template.bind({});
WeekAgo.args = { date: nowSub(DAY * 7) };

export const YearAgo = Template.bind({});
YearAgo.args = { date: nowSub(DAY * 365) };

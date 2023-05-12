import { StoryFn } from '@storybook/react';

import { FormattedDate, FormattedDateProps } from './formattedDate.component';

const Template: StoryFn<FormattedDateProps> = (args: FormattedDateProps) => {
  return <FormattedDate {...args} />;
};

export default {
  title: 'Core/DateTime/FormattedDate',
  component: FormattedDate,
};

export const Default = {
  render: Template,
  args: { value: new Date() },
};

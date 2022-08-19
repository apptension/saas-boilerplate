import { Story } from '@storybook/react';
import { FormattedDate, FormattedDateProps } from './formattedDate.component';

const Template: Story<FormattedDateProps> = (args: FormattedDateProps) => {
  return <FormattedDate {...args} />;
};

export default {
  title: 'Shared/DateTime/FormattedDate',
  component: FormattedDate,
};

export const Default = Template.bind({});
Default.args = { value: new Date() };

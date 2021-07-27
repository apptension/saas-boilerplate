import { Story } from '@storybook/react';
import * as faker from 'faker';
import { FormattedDate, FormattedDateProps } from './formattedDate.component';

const Template: Story<FormattedDateProps> = (args) => {
  return <FormattedDate {...args} />;
};

export default {
  title: 'Shared/DateTime/FormattedDate',
  component: FormattedDate,
};

export const Default = Template.bind({});
Default.args = { value: faker.date.recent(1) };

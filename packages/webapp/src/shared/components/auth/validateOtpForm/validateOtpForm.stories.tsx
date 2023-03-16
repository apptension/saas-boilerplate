import { Story } from '@storybook/react';

import { ValidateOtpForm } from './validateOtpForm.component';

const Template: Story = (args) => {
  return <ValidateOtpForm {...args} />;
};

export default {
  title: 'Shared/Auth/ValidateOtpForm',
  component: ValidateOtpForm,
};

export const Default = Template.bind({});
Default.args = {};

import { StoryFn } from '@storybook/react';

import { ValidateOtpForm } from './validateOtpForm.component';

const Template: StoryFn = (args) => {
  return <ValidateOtpForm {...args} />;
};

export default {
  title: 'Shared/Auth/ValidateOtpForm',
  component: ValidateOtpForm,
};

export const Default = {
  render: Template,
  args: {},
};

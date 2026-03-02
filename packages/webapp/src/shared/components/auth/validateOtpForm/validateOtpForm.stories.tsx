import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { ValidateOtpForm } from './validateOtpForm.component';

const Template: StoryFn = () => {
  return <ValidateOtpForm />;
};

export default {
  title: 'Shared/Auth/ValidateOtpForm',
  component: ValidateOtpForm,
  parameters: {
    layout: 'centered',
  },
};

export const Default = {
  render: Template,
  decorators: [withProviders({})],
};

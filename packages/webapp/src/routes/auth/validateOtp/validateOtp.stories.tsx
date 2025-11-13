import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../shared/utils/storybook';
import { ValidateOtp } from './validateOtp.component';

const Template: StoryFn = () => {
  return <ValidateOtp />;
};

export default {
  title: 'Routes/Auth/ValidateOtp',
  component: ValidateOtp,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default = {
  render: Template,
  decorators: [withProviders({})],
};


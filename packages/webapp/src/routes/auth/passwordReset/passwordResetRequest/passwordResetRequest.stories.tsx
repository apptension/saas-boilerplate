import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../../shared/utils/storybook';
import { PasswordResetRequest } from './passwordResetRequest.component';

const Template: StoryFn = () => {
  return <PasswordResetRequest />;
};

export default {
  title: 'Routes/Auth/PasswordResetRequest',
  component: PasswordResetRequest,
};

export const Default = {
  render: Template,
  decorators: [withProviders({})],
};

import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { AddTwoFactorAuth, AddTwoFactorAuthProps } from './addTwoFactorAuth.component';

const Template: StoryFn<AddTwoFactorAuthProps> = (args) => {
  return <AddTwoFactorAuth {...args} />;
};

export default {
  title: 'Shared/Auth/AddTwoFactorAuth',
  component: AddTwoFactorAuth,
};

export const Default = {
  render: Template,
  args: {},
  decorators: [withProviders({})],
};

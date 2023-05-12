import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { SignupForm } from './signupForm.component';

const Template: StoryFn = () => {
  return <SignupForm />;
};

export default {
  title: 'Shared/Auth/SignupForm',
  component: SignupForm,
};

export const Default = {
  render: Template,
  decorators: [withProviders({})],
};

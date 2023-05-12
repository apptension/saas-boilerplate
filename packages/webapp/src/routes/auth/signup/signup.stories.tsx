import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../shared/utils/storybook';
import { Signup } from './signup.component';

const Template: StoryFn = () => {
  return <Signup />;
};

export default {
  title: 'Routes/Auth/Signup',
  component: Signup,
};

export const Default = {
  render: Template,
  decorators: [withProviders({})],
};

import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { StoryFn } from '@storybook/react';

import { withProviders } from '../../shared/utils/storybook';
import { Profile } from './profile.component';

const Template: StoryFn = () => {
  return <Profile />;
};

export default {
  title: 'Routes/Profile',
  component: Profile,
};

export const Default = {
  render: Template,

  decorators: [
    withProviders({
      apolloMocks: [fillCommonQueryWithUser(currentUserFactory())],
    }),
  ],
};

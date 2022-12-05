import { Story } from '@storybook/react';

import { withProviders } from '../../shared/utils/storybook';
import { currentUserFactory } from '../../mocks/factories';
import { fillCommonQueryWithUser } from '../../shared/utils/commonQuery';
import { Profile } from './profile.component';

const Template: Story = () => {
  return <Profile />;
};

export default {
  title: 'Routes/Profile',
  component: Profile,
};

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env, currentUserFactory());
    },
  }),
];

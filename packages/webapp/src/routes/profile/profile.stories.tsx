import { currentUserFactory } from '@sb/webapp-api-client/tests/factories';
import { Story } from '@storybook/react';

import { fillCommonQueryWithUser } from '../../tests/factories';
import { withProviders } from '../../shared/utils/storybook';
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
    apolloMocks: [fillCommonQueryWithUser(currentUserFactory())],
  }),
];

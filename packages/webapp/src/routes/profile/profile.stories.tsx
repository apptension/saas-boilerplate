import { Story } from '@storybook/react';

import { currentUserFactory } from '../../mocks/factories';
import { fillCommonQueryWithUser } from '../../shared/utils/commonQuery';
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
    apolloMocks: [fillCommonQueryWithUser(undefined, currentUserFactory())],
  }),
];

import { Story } from '@storybook/react';
import { createMockEnvironment } from 'relay-test-utils';

import { ProvidersWrapper } from '../../shared/utils/testUtils';
import { currentUserFactory } from '../../mocks/factories';
import { fillCommonQueryWithUser } from '../../shared/utils/commonQuery';
import { Profile } from './profile.component';

const Template: Story = () => {
  const relayEnvironment = createMockEnvironment();
  fillCommonQueryWithUser(relayEnvironment, currentUserFactory());

  return (
    <ProvidersWrapper
      context={{
        relayEnvironment,
      }}
    >
      <Profile />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Routes/Profile',
  component: Profile,
};

export const Default = Template.bind({});

import React from 'react';
import { Story } from '@storybook/react';

import { ProvidersWrapper } from '../../../shared/utils/testUtils';
import { prepareState } from '../../../mocks/store';
import { userProfileFactory } from '../../../mocks/factories';
import { ProfileDetails } from './profileDetails.component';

const store = prepareState((state) => {
  state.auth.profile = userProfileFactory();
});

const Template: Story = (args) => {
  return (
    <ProvidersWrapper context={{ store }}>
      <ProfileDetails {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/ProfileDetails',
  component: ProfileDetails,
};

export const Default = Template.bind({});

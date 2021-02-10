import React from 'react';
import { Story } from '@storybook/react';

import { prepareState } from '../../../../mocks/store';
import { userProfileFactory } from '../../../../mocks/factories';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { EditProfileForm } from './editProfileForm.component';

const store = prepareState((state) => {
  state.auth.profile = userProfileFactory();
});

const Template: Story = (args) => {
  return (
    <ProvidersWrapper context={{ store }}>
      <EditProfileForm {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/EditProfileForm',
  component: EditProfileForm,
};

export const Default = Template.bind({});

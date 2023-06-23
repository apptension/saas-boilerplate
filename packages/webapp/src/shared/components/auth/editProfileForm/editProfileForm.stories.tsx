import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { StoryFn } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { EditProfileForm } from './editProfileForm.component';

const Template: StoryFn = () => {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 lg:px-10">
      <EditProfileForm />
    </div>
  );
};

export default {
  title: 'Shared/Auth/EditProfileForm',
  component: EditProfileForm,
};

export const Default = {
  render: Template,

  decorators: [
    withProviders({
      apolloMocks: [fillCommonQueryWithUser(currentUserFactory())],
    }),
  ],
};

import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { size } from '@sb/webapp-core/theme';
import { StoryFn } from '@storybook/react';
import styled from 'styled-components';

import { withProviders } from '../../../utils/storybook';
import { EditProfileForm } from './editProfileForm.component';

const Container = styled.div`
  ${size.contentWrapper};
  ${size.contentWithLimitedWidth};
`;

const Template: StoryFn = () => {
  return (
    <Container>
      <EditProfileForm />
    </Container>
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

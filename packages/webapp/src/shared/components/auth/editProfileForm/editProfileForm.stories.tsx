import { size } from '@saas-boilerplate-app/webapp-core/theme';
import { Story } from '@storybook/react';
import styled from 'styled-components';

import { currentUserFactory } from '../../../../mocks/factories';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';
import { withProviders } from '../../../utils/storybook';
import { EditProfileForm } from './editProfileForm.component';

const Container = styled.div`
  ${size.contentWrapper};
  ${size.contentWithLimitedWidth};
`;

const Template: Story = () => {
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

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    apolloMocks: [fillCommonQueryWithUser(currentUserFactory())],
  }),
];

import { Story } from '@storybook/react';
import styled from 'styled-components';

import { currentUserFactory } from '../../../../mocks/factories';
import { contentWithLimitedWidth, contentWrapper } from '../../../../theme/size';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';
import { withProviders } from '../../../utils/storybook';
import { EditProfileForm } from './editProfileForm.component';

const Container = styled.div`
  ${contentWrapper};
  ${contentWithLimitedWidth};
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
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env, currentUserFactory());
    },
  }),
];

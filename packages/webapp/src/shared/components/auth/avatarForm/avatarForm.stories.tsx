import styled from 'styled-components';
import { Story } from '@storybook/react';

import { withProviders } from '../../../utils/storybook';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';
import { currentUserFactory } from '../../../../mocks/factories';
import { AvatarForm } from './avatarForm.component';

const Container = styled.div`
  padding: 20px;
`;

const Template: Story = () => {
  return (
    <Container>
      <AvatarForm />
    </Container>
  );
};

export default {
  title: 'Shared/Auth/AvatarForm',
  component: AvatarForm,
};

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    relayEnvironment: (env) => {
      fillCommonQueryWithUser(env, currentUserFactory());
    },
  }),
];

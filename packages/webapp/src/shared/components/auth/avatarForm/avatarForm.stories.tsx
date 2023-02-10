import { Story } from '@storybook/react';
import styled from 'styled-components';

import { currentUserFactory } from '../../../../mocks/factories';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';
import { withProviders } from '../../../utils/storybook';
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
    apolloMocks: [fillCommonQueryWithUser(undefined, currentUserFactory())],
  }),
];

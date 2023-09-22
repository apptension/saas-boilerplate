import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { StoryFn } from '@storybook/react';
import { styled } from 'styled-components';



import { withProviders } from '../../../utils/storybook';
import { AvatarForm } from './avatarForm.component';


const Container = styled.div`
  padding: 20px;
`;

const Template: StoryFn = () => {
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

export const Default = {
  render: Template,

  decorators: [
    withProviders({
      apolloMocks: [fillCommonQueryWithUser(currentUserFactory())],
    }),
  ],
};

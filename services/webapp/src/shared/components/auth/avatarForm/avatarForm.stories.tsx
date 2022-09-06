import styled from 'styled-components';
import { Story } from '@storybook/react';
import { createMockEnvironment } from 'relay-test-utils';

import { withRedux } from '../../../utils/storybook';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';
import { currentUserFactory } from '../../../../mocks/factories';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { AvatarForm } from './avatarForm.component';

const Container = styled.div`
  padding: 20px;
`;

const Template: Story = () => {
  const relayEnvironment = createMockEnvironment();
  fillCommonQueryWithUser(relayEnvironment, currentUserFactory());

  return (
    <ProvidersWrapper
      context={{
        relayEnvironment,
      }}
    >
      <Container>
        <AvatarForm />
      </Container>
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/AvatarForm',
  component: AvatarForm,
  decorators: [withRedux()],
};

export const Default = Template.bind({});

import { Story } from '@storybook/react';
import styled from 'styled-components';
import { createMockEnvironment } from 'relay-test-utils';

import { currentUserFactory } from '../../../../mocks/factories';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { contentWithLimitedWidth, contentWrapper } from '../../../../theme/size';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';
import { EditProfileForm } from './editProfileForm.component';

const Container = styled.div`
  ${contentWrapper};
  ${contentWithLimitedWidth};
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
        <EditProfileForm />
      </Container>
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/EditProfileForm',
  component: EditProfileForm,
};

export const Default = Template.bind({});

import { Story } from '@storybook/react';
import styled from 'styled-components';
import { userProfileFactory } from '../../../../mocks/factories';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { contentWithLimitedWidth, contentWrapper } from '../../../../theme/size';
import { EditProfileForm } from './editProfileForm.component';

const Container = styled.div`
  ${contentWrapper};
  ${contentWithLimitedWidth};
`;

const Template: Story = () => {
  return (
    <ProvidersWrapper
      context={{
        store: (state) => {
          state.auth.profile = userProfileFactory();
        },
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

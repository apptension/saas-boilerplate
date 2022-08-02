import styled from 'styled-components';
import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { contentWithLimitedWidth, contentWrapper } from '../../../../theme/size';
import { ChangePasswordForm } from './changePasswordForm.component';

const Container = styled.div`
  ${contentWrapper};
  ${contentWithLimitedWidth};
`;

const Template: Story = () => {
  return (
    <ProvidersWrapper>
      <Container>
        <ChangePasswordForm />
      </Container>
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/ChangePasswordForm',
  component: ChangePasswordForm,
};

export const Default = Template.bind({});

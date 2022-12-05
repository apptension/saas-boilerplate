import styled from 'styled-components';
import { Story } from '@storybook/react';
import { contentWithLimitedWidth, contentWrapper } from '../../../../theme/size';
import { withProviders } from '../../../utils/storybook';
import { ChangePasswordForm } from './changePasswordForm.component';

const Container = styled.div`
  ${contentWrapper};
  ${contentWithLimitedWidth};
`;

const Template: Story = () => {
  return (
    <Container>
      <ChangePasswordForm />
    </Container>
  );
};

export default {
  title: 'Shared/Auth/ChangePasswordForm',
  component: ChangePasswordForm,
};

export const Default = Template.bind({});
Default.decorators = [withProviders({})];

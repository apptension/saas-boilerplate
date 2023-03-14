import { size } from '@saas-boilerplate-app/webapp-core/theme';
import { Story } from '@storybook/react';
import styled from 'styled-components';

import { withProviders } from '../../../utils/storybook';
import { ChangePasswordForm } from './changePasswordForm.component';

const Container = styled.div`
  ${size.contentWrapper};
  ${size.contentWithLimitedWidth};
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

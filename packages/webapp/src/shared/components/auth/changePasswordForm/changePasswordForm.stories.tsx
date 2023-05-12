import { size } from '@sb/webapp-core/theme';
import { StoryFn } from '@storybook/react';
import styled from 'styled-components';

import { withProviders } from '../../../utils/storybook';
import { ChangePasswordForm } from './changePasswordForm.component';

const Container = styled.div`
  ${size.contentWrapper};
  ${size.contentWithLimitedWidth};
`;

const Template: StoryFn = () => {
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

export const Default = {
  render: Template,
  decorators: [withProviders({})],
};

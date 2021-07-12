import styled from 'styled-components';
import { Story } from '@storybook/react';
import { withRedux } from '../../../utils/storybook';
import { AvatarForm } from './avatarForm.component';

const Container = styled.div`
  padding: 20px;
`;

const Template: Story = () => (
  <Container>
    <AvatarForm />
  </Container>
);

export default {
  title: 'Shared/Auth/AvatarForm',
  component: AvatarForm,
  decorators: [withRedux()],
};

export const Default = Template.bind({});

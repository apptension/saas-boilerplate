import { Story } from '@storybook/react';
import { withProviders } from '../../../utils/storybook';
import { PasswordResetRequestForm } from './passwordResetRequestForm.component';

const Template: Story = () => {
  return <PasswordResetRequestForm />;
};

export default {
  title: 'Shared/Auth/PasswordResetRequestForm',
  component: PasswordResetRequestForm,
};

export const Default = Template.bind({});
Default.decorators = [withProviders({})];

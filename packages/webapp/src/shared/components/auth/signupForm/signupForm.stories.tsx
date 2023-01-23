import { Story } from '@storybook/react';
import { withProviders } from '../../../utils/storybook';
import { SignupForm } from './signupForm.component';

const Template: Story = () => {
  return <SignupForm />;
};

export default {
  title: 'Shared/Auth/SignupForm',
  component: SignupForm,
};

export const Default = Template.bind({});
Default.decorators = [withProviders({})];

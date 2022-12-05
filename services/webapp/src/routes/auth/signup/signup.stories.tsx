import { Story } from '@storybook/react';
import { withProviders } from '../../../shared/utils/storybook';
import { Signup } from './signup.component';

const Template: Story = () => {
  return <Signup />;
};

export default {
  title: 'Routes/Auth/Signup',
  component: Signup,
};

export const Default = Template.bind({});
Default.decorators = [withProviders({})];

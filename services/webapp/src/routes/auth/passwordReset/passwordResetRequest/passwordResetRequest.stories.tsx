import { Story } from '@storybook/react';
import { withProviders } from '../../../../shared/utils/storybook';
import { PasswordResetRequest } from './passwordResetRequest.component';

const Template: Story = () => {
  return <PasswordResetRequest />;
};

export default {
  title: 'Routes/Auth/PasswordResetRequest',
  component: PasswordResetRequest,
};

export const Default = Template.bind({});
Default.decorators = [withProviders({})];

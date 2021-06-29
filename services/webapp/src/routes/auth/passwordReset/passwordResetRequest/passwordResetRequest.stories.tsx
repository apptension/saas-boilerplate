import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../../../shared/utils/testUtils';
import { PasswordResetRequest } from './passwordResetRequest.component';

const Template: Story = (args) => {
  return (
    <ProvidersWrapper>
      <PasswordResetRequest {...args} />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/PasswordResetRequest',
  component: PasswordResetRequest,
};

export const Default = Template.bind({});

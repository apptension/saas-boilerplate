import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../../../shared/utils/testUtils';
import { PasswordResetConfirm } from './passwordResetConfirm.component';

const Template: Story = () => {
  return (
    <ProvidersWrapper>
      <PasswordResetConfirm />
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Auth/PasswordResetConfirm',
  component: PasswordResetConfirm,
};

export const Default = Template.bind({});

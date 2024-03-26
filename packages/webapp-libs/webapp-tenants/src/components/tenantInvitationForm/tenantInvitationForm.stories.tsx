import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { TenantRole } from '../../modules/auth/tenantRole.types';
import { withProviders } from '../../utils/storybook';
import { TenantInvitationForm, TenantInvitationFormProps } from './tenantInvitationForm.component';

const Template: StoryFn<TenantInvitationFormProps> = (args: TenantInvitationFormProps) => {
  return <TenantInvitationForm {...args} />;
};

const meta: Meta = {
  title: 'Tenants / TenantInvitationForm',
  component: Template,
};

export default meta;

export const WithInitialData: StoryObj<typeof meta> = {
  args: {
    initialData: {
      email: 'example@email.com',
      role: TenantRole.MEMBER,
    },
  },

  decorators: [withProviders({})],
};

export const WithoutData: StoryObj<typeof meta> = {
  decorators: [withProviders({})],
};

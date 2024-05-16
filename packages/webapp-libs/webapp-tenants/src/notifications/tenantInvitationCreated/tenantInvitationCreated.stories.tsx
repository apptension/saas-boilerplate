import { NotificationTypes } from '@sb/webapp-notifications';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { TenantInvitationCreated, TenantInvitationCreatedProps } from './tenantInvitationCreated.component';

const Template: StoryFn<TenantInvitationCreatedProps> = (args: TenantInvitationCreatedProps) => {
  return <TenantInvitationCreated {...args} />;
};

const meta: Meta = {
  title: 'Tenants / Notifications / TenantInvitationCreated',
  component: Template,
};

export default meta;

export const Default: StoryObj<TenantInvitationCreatedProps> = {
  args: {
    type: NotificationTypes.TENANT_INVITATION_CREATED,
    readAt: null,
    createdAt: '2021-06-17T11:45:33',

    data: {
      id: 'data-mock-uuid',
      tenant_name: 'Lorem ipsum',
    },
    issuer: {
      id: 'mock-user-uuid',
      email: 'example@example.com',
      avatar: 'https://picsum.photos/24/24',
    },
  },

  decorators: [withProviders()],
};

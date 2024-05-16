import { NotificationTypes } from '@sb/webapp-notifications';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { withProviders } from '../../utils/storybook';
import { TenantInvitationAccepted, TenantInvitationAcceptedProps } from './tenantInvitationAccepted.component';

const Template: StoryFn<TenantInvitationAcceptedProps> = (args: TenantInvitationAcceptedProps) => {
  return <TenantInvitationAccepted {...args} />;
};

const meta: Meta = {
  title: 'Tenants / Notifications / TenantInvitationAccepted',
  component: Template,
};

export default meta;

export const Default: StoryObj<TenantInvitationAcceptedProps> = {
  args: {
    type: NotificationTypes.TENANT_INVITATION_ACCEPTED,
    readAt: null,
    createdAt: '2021-06-17T11:45:33',

    data: {
      id: 'data-mock-uuid',
      name: 'User Name',
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

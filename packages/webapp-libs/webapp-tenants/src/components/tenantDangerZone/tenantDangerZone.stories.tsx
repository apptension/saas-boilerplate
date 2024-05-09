import { TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { membershipFactory, tenantFactory } from '../../tests/factories/tenant';
import { withProviders } from '../../utils/storybook';
import { TenantDangerZone } from './tenantDangerZone.component';

const Template: StoryFn = () => {
  return <TenantDangerZone />;
};

const meta: Meta = {
  title: 'Tenants / TenantDangerZone',
  component: Template,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
  decorators: [withProviders({})],
};

const ownerUserResponse = fillCommonQueryWithUser(
  currentUserFactory({
    tenants: [
      tenantFactory({
        name: 'name',
        id: '1',
        membership: membershipFactory({ role: TenantUserRole.OWNER }),
      }),
    ],
  })
);

export const OwnerView: StoryObj<typeof meta> = {
  render: Template,
  decorators: [
    withProviders({
      apolloMocks: [ownerUserResponse],
    }),
  ],
};

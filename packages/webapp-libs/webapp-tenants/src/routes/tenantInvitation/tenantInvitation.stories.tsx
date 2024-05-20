import { TenantUserRole } from '@sb/webapp-api-client';
import { TenantType as TenantTypeType } from '@sb/webapp-api-client/constants';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { getLocalePath } from '@sb/webapp-core/utils';
import { StoryFn, StoryObj } from '@storybook/react';
import { Route, Routes } from 'react-router';

import { tenantFactory } from '../../tests/factories/tenant';
import { createMockRouterProps } from '../../tests/utils/rendering';
import { withProviders } from '../../utils/storybook';
import { TenantInvitation } from './tenantInvitation.component';

const invitationToken = 'invitation-token';
const routePath = RoutesConfig.tenantInvitation;

const Template: StoryFn = () => {
  return (
    <Routes>
      <Route path={getLocalePath(routePath)} element={<TenantInvitation />} />
    </Routes>
  );
};

export default {
  title: 'Tenants / TenantInvitation',
  component: TenantInvitation,
};

export const Default: StoryObj = {
  render: Template,
  decorators: [
    withProviders({
      routerProps: createMockRouterProps(routePath, {
        token: invitationToken,
        tenantId: '',
      }),
      apolloMocks: [
        fillCommonQueryWithUser(
          currentUserFactory({
            tenants: [
              tenantFactory({ membership: { role: TenantUserRole.OWNER } }),
              tenantFactory({
                membership: {
                  role: TenantUserRole.MEMBER,
                  invitationAccepted: false,
                  invitationToken,
                },
                type: TenantTypeType.ORGANIZATION,
              }),
            ],
          })
        ),
      ],
    }),
  ],
};

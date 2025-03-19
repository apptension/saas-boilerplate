import { TenantUserRole } from '@sb/webapp-api-client';
import { TenantType } from '@sb/webapp-api-client/constants';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult, makeId } from '@sb/webapp-api-client/tests/utils';
import { Tabs } from '@sb/webapp-core/components/ui/tabs';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { tenantMembersListQuery } from '../../../../components/tenantMembersList/tenantMembersList.graphql';
import { RoutesConfig } from '../../../../config/routes';
import { membershipFactory, tenantFactory } from '../../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { TenantMembers } from '../tenantMembers.component';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual<NodeModule>('react-router-dom'),
    useNavigate: () => mockNavigate,
  };
});

const tenantId = 'testId';

describe('TenantMembers: Component', () => {
  const Component = () => (
    <Tabs value={`/en/${tenantId}/tenant/settings/members`}>
      <TenantMembers />
    </Tabs>
  );

  it('should render alert for personal account', async () => {
    const tenant = tenantFactory({ id: tenantId, type: TenantType.PERSONAL });
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId });

    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] }))];

    render(<Component />, { apolloMocks, routerProps });

    expect(await screen.findByTestId('tenant-members-alert')).toBeInTheDocument();
    expect(await screen.findByTestId('tenant-members-create-button')).toBeInTheDocument();
  });

  it('should handle new tenant click', async () => {
    const tenant = tenantFactory({ id: tenantId, type: TenantType.PERSONAL });
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId });

    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] }))];

    render(<Component />, { apolloMocks, routerProps });

    const newTenantButton = await screen.findByTestId('tenant-members-create-button');
    await userEvent.click(newTenantButton);

    expect(mockNavigate).toHaveBeenCalledWith('/en/add-tenant');
  });

  it('should render members with invitation form', async () => {
    const tenant = tenantFactory({ id: tenantId, type: TenantType.ORGANIZATION });
    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId });
    const listQueryVariables = {
      id: tenant.id,
    };

    const listQueryData = {
      tenant: {
        userMemberships: [
          membershipFactory({
            role: TenantUserRole.ADMIN,
            inviteeEmailAddress: null,
            userId: makeId(32),
            firstName: 'Firstname 1',
            lastName: 'Firstname 1',
            userEmail: null,
            avatar: null,
          }),
        ],
      },
    };

    const requestListMock = composeMockedQueryResult(tenantMembersListQuery, {
      variables: listQueryVariables,
      data: listQueryData,
    });

    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] })), requestListMock];

    render(<Component />, { apolloMocks, routerProps });

    expect(await screen.findByTestId('tenant-members-list')).toBeInTheDocument();
  });
});

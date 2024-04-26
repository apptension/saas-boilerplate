import { TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult, makeId } from '@sb/webapp-api-client/tests/utils';
import { RoutesConfig } from '@sb/webapp-core/config/routes';

import { membershipFactory, tenantFactory } from '../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../tests/utils/rendering';
import { TenantMembersList } from '../tenantMembersList.component';
import { tenantMembersListQuery } from '@sb/webapp-tenants/components/tenantMembersList/tenantMembersList.graphql';

describe('TenantMembersList: Component', () => {
  const Component = () => <TenantMembersList />;

  it('should render list of memberships', async () => {
    const currentUserMembership = membershipFactory({ role: TenantUserRole.OWNER });
    const tenant = tenantFactory({ membership: currentUserMembership });
    const user = currentUserFactory({ tenants: [tenant] });
    const commonQueryMock = fillCommonQueryWithUser(user);
    const routerProps = createMockRouterProps(RoutesConfig.home, { tenantId: tenant.id });

    const listQueryVariables = {
      id: tenant.id,
    };

    const listQueryData = {
      tenant: {
        userMemberships: [
          membershipFactory({
            role: TenantUserRole.OWNER,
            inviteeEmailAddress: null,
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            userEmail: user.email,
            avatar: null,
          }),
          membershipFactory({
            role: TenantUserRole.ADMIN,
            inviteeEmailAddress: null,
            userId: makeId(32),
            firstName: 'Firstname 1',
            lastName: 'Firstname 1',
            userEmail: null,
            avatar: null,
          }),
          membershipFactory({
            role: TenantUserRole.MEMBER,
            invitationAccepted: false,
            inviteeEmailAddress: 'example@example.com',
            userId: makeId(32),
            firstName: null,
            lastName: null,
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

    const { container, waitForApolloMocks } = render(<Component />, {
      apolloMocks: [commonQueryMock, requestListMock],
      routerProps,
    });
    await waitForApolloMocks();
    expect(container).toMatchSnapshot();
  });
});

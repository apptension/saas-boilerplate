import { TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';

import { membershipFactory, tenantFactory } from '../../../tests/factories/tenant';
import { PLACEHOLDER_CONTENT, PLACEHOLDER_TEST_ID, render } from '../../../tests/utils/rendering';
import { RoleAccessProps, TenantRoleAccess } from '../tenantRoleAccess.component';

describe('TenantRoleAccess: Component', () => {
  const defaultProps: RoleAccessProps = {
    allowedRoles: [TenantUserRole.ADMIN],
    children: PLACEHOLDER_CONTENT,
  };

  const Component = (props: Partial<RoleAccessProps>) => <TenantRoleAccess {...defaultProps} {...props} />;

  const createUser = (role: TenantUserRole) => {
    const currentUserMembership = membershipFactory({ role });
    const tenant = tenantFactory({ membership: currentUserMembership });
    return currentUserFactory({ tenants: [tenant] });
  };

  it('should render children if user has allowed role', async () => {
    const user = createUser(TenantUserRole.ADMIN);
    const apolloMocks = [fillCommonQueryWithUser(user)];
    render(<Component allowedRoles={TenantUserRole.ADMIN} />, { apolloMocks });
    expect(await screen.findByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should render nothing if user doesnt have allowed role', async () => {
    const user = createUser(TenantUserRole.MEMBER);
    const apolloMocks = [fillCommonQueryWithUser(user)];
    const { waitForApolloMocks } = render(<Component allowedRoles={TenantUserRole.ADMIN} />, { apolloMocks });
    await waitForApolloMocks();
    expect(screen.queryByTestId(PLACEHOLDER_TEST_ID)).not.toBeInTheDocument();
  });
});

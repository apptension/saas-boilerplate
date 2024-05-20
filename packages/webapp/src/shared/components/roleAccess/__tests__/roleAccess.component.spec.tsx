import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';

import { Role } from '../../../../modules/auth/auth.types';
import { PLACEHOLDER_CONTENT, PLACEHOLDER_TEST_ID, render } from '../../../../tests/utils/rendering';
import { RoleAccess, TenantRoleAccessProps } from '../roleAccess.component';

describe('RoleAccess: Component', () => {
  const defaultProps: TenantRoleAccessProps = {
    allowedRoles: [Role.ADMIN],
    children: PLACEHOLDER_CONTENT,
  };

  const Component = (props: Partial<TenantRoleAccessProps>) => <RoleAccess {...defaultProps} {...props} />;

  it('should render children if user has allowed role', async () => {
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ roles: [Role.ADMIN] }))];
    render(<Component allowedRoles={Role.ADMIN} />, { apolloMocks });
    expect(await screen.findByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should render nothing if user doesnt have allowed role', async () => {
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ roles: [Role.USER] }))];
    const { waitForApolloMocks } = render(<Component allowedRoles={Role.ADMIN} />, { apolloMocks });
    await waitForApolloMocks();
    expect(screen.queryByTestId(PLACEHOLDER_TEST_ID)).not.toBeInTheDocument();
  });
});

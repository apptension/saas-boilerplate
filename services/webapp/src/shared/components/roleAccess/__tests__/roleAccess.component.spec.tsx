import { screen } from '@testing-library/react';
import { makeContextRenderer } from '../../../utils/testUtils';
import { Role } from '../../../../modules/auth/auth.types';
import { RoleAccess, RoleAccessProps } from '../roleAccess.component';
import { prepareState } from '../../../../mocks/store';

describe('RoleAccess: Component', () => {
  const defaultProps: RoleAccessProps = {
    allowedRoles: [Role.ADMIN],
    children: <span data-testid="content" />,
  };

  const component = (props: Partial<RoleAccessProps>) => <RoleAccess {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render children if user has allowed role', () => {
    const store = prepareState((state) => {
      state.auth.profile = {
        email: 'user@mail.com',
        roles: [Role.ADMIN],
      };
    });
    render({ allowedRoles: Role.ADMIN }, { store });
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should render nothing if user doesnt have allowed role', () => {
    const store = prepareState((state) => {
      state.auth.profile = {
        email: 'user@mail.com',
        roles: [Role.USER],
      };
    });
    render({ allowedRoles: Role.ADMIN }, { store });
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });
});

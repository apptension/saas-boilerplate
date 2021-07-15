import { screen } from '@testing-library/react';
import { makeContextRenderer, PLACEHOLDER_CONTENT, PLACEHOLDER_TEST_ID } from '../../../utils/testUtils';
import { Profile, Role } from '../../../../modules/auth/auth.types';
import { RoleAccess, RoleAccessProps } from '../roleAccess.component';
import { prepareState } from '../../../../mocks/store';
import { userProfileFactory } from '../../../../mocks/factories';

describe('RoleAccess: Component', () => {
  const defaultProps: RoleAccessProps = {
    allowedRoles: [Role.ADMIN],
    children: PLACEHOLDER_CONTENT,
  };

  const prepareProfileState = (profile: Partial<Profile>) =>
    prepareState((state) => {
      state.auth.profile = userProfileFactory(profile);
    });

  const component = (props: Partial<RoleAccessProps>) => <RoleAccess {...defaultProps} {...props} />;
  const render = makeContextRenderer(component);

  it('should render children if user has allowed role', () => {
    const store = prepareProfileState({
      email: 'user@mail.com',
      roles: [Role.ADMIN],
    });
    render({ allowedRoles: Role.ADMIN }, { store });
    expect(screen.getByTestId(PLACEHOLDER_TEST_ID)).toBeInTheDocument();
  });

  it('should render nothing if user doesnt have allowed role', () => {
    const store = prepareProfileState({
      email: 'user@mail.com',
      roles: [Role.USER],
    });
    render({ allowedRoles: Role.ADMIN }, { store });
    expect(screen.queryByTestId(PLACEHOLDER_TEST_ID)).not.toBeInTheDocument();
  });
});

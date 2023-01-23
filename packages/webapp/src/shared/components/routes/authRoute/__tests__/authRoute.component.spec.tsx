import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';

import { AuthRoute, AuthRouteProps } from '../authRoute.component';
import { render } from '../../../../../tests/utils/rendering';
import { currentUserFactory } from '../../../../../mocks/factories';
import { Role } from '../../../../../modules/auth/auth.types';
import { getRelayEnv } from '../../../../../tests/utils/relay';

const mockDispatch = jest.fn();
jest.mock('../../../../../theme/initializeFontFace');

jest.mock('react-redux', () => ({
  ...jest.requireActual<NodeModule>('react-redux'),
  useDispatch: () => mockDispatch,
}));

describe('AuthRoute: Component', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  const defaultProps: AuthRouteProps = {};

  const Component = (props: Partial<AuthRouteProps>) => (
    <Routes>
      <Route path="/" element={<AuthRoute {...defaultProps} {...props} />}>
        <Route index element={<span data-testid="content" />} />
      </Route>
      <Route path="/en/auth/login" element={<span data-testid="login-content" />} />
      <Route path="/en/404" element={<span data-testid="404-content" />} />
    </Routes>
  );

  describe('user profile is fetched', () => {
    describe('no allowedRoles prop is specified', () => {
      it('should render content', () => {
        const relayEnvironment = getRelayEnv(
          currentUserFactory({
            roles: [Role.ADMIN],
          })
        );
        render(<Component />, { relayEnvironment });
        expect(screen.getByTestId('content')).toBeInTheDocument();
      });
    });

    describe('user has required role', () => {
      it('should render content', () => {
        const relayEnvironment = getRelayEnv(
          currentUserFactory({
            roles: [Role.ADMIN],
          })
        );
        render(<Component allowedRoles={Role.ADMIN} />, { relayEnvironment });
        expect(screen.getByTestId('content')).toBeInTheDocument();
      });
    });

    describe('user doesnt have required role', () => {
      it('should redirect to not found page', () => {
        const relayEnvironment = getRelayEnv(
          currentUserFactory({
            roles: [Role.USER],
          })
        );
        render(<Component allowedRoles={Role.ADMIN} />, { relayEnvironment });
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
        expect(screen.getByTestId('404-content')).toBeInTheDocument();
      });
    });

    describe('user is not logged in', () => {
      it('should redirect to login page', () => {
        render(<Component allowedRoles={Role.ADMIN} />);
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
        expect(screen.getByTestId('login-content')).toBeInTheDocument();
      });
    });
  });
});

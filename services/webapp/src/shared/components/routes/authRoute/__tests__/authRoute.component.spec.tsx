import { screen } from '@testing-library/react';
import { Route } from 'react-router-dom';
import { AuthRoute, AuthRouteProps } from '../authRoute.component';
import { makeContextRenderer, spiedHistory } from '../../../../utils/testUtils';
import { prepareState } from '../../../../../mocks/store';
import { loggedInAuthFactory, loggedOutAuthFactory, userProfileFactory } from '../../../../../mocks/factories';
import { Role } from '../../../../../modules/auth/auth.types';

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

  const component = (props: Partial<AuthRouteProps>) => (
    <AuthRoute {...defaultProps} {...props} />
  );
  const render = makeContextRenderer(component, {
    router: {
      children: <Route path="*" element={<span data-testid="content" />} />,
      routePath: '*',
    }
  });

  describe('user profile is not fetched yet', () => {
    it('should render nothing', () => {
      const store = prepareState((state) => {
        state.startup.profileStartupCompleted = false;
      });
      render({}, { store });
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });

  describe('user profile is fetched', () => {
    describe('no allowedRoles prop is specified', () => {
      it('should render content', () => {
        const store = prepareState((state) => {
          state.startup.profileStartupCompleted = true;
          state.auth.profile = userProfileFactory({ roles: [Role.ADMIN] });
        });
        render({}, { store });
        expect(screen.getByTestId('content')).toBeInTheDocument();
      });
    });

    describe('user has required role', () => {
      it('should render content', () => {
        const store = prepareState((state) => {
          state.startup.profileStartupCompleted = true;
          state.auth.profile = userProfileFactory({ roles: [Role.ADMIN] });
        });
        render({ allowedRoles: Role.ADMIN }, { store });
        expect(screen.getByTestId('content')).toBeInTheDocument();
      });
    });

    describe('user doesnt have required role', () => {
      it('should redirect to not found page', () => {
        const store = prepareState((state) => {
          state.startup.profileStartupCompleted = true;
          state.auth = loggedInAuthFactory({ profile: userProfileFactory({ roles: [Role.USER] }) });
        });
        const { pushSpy, history } = spiedHistory();
        render({ allowedRoles: Role.ADMIN }, { store, router: { history } });
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
        expect(pushSpy).toHaveBeenCalledWith({ hash: '', pathname: '/en/404', 'search': ''}, undefined);
      });
    });

    describe('user is not logged in', () => {
      it('should redirect to login page', () => {
        const store = prepareState((state) => {
          state.startup.profileStartupCompleted = true;
          state.auth = loggedOutAuthFactory();
        });
        const { pushSpy, history } = spiedHistory();
        render({ allowedRoles: Role.ADMIN }, { store, router: { history } });
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
        expect(pushSpy).toHaveBeenCalledWith({ hash: '', pathname: '/en/auth/login', 'search': ''}, undefined);
      });
    });
  });
});

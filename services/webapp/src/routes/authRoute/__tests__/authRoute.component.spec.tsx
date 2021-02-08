import React from 'react';

import { screen } from '@testing-library/react';
import { AuthRoute, AuthRouteProps } from '../authRoute.component';
import { startupActions } from '../../../modules/startup';
import { makeContextRenderer, spiedHistory } from '../../../shared/utils/testUtils';
import { prepareState } from '../../../mocks/store';
import { userProfileFactory } from '../../../mocks/factories';
import { Role } from '../../../modules/auth/auth.types';

const mockDispatch = jest.fn();
jest.mock('../../../theme/initializeFontFace');

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
    <AuthRoute {...defaultProps} {...props}>
      <span data-testid="content" />
    </AuthRoute>
  );
  const render = makeContextRenderer(component);

  it('should call profileStartup on mount', () => {
    render();
    expect(mockDispatch).toHaveBeenCalledWith(startupActions.profileStartup());
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
          state.auth.profile = userProfileFactory({ roles: [Role.USER] });
        });
        const { pushSpy, history } = spiedHistory();
        render({ allowedRoles: Role.ADMIN }, { store, router: { history } });
        expect(screen.queryByTestId('content')).not.toBeInTheDocument();
        expect(pushSpy).toHaveBeenCalledWith('/en/404');
      });
    });
  });
});

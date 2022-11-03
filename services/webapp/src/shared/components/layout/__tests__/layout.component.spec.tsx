import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { Layout } from '../layout.component';
import { createMockRouterHistory, render } from '../../../../tests/utils/rendering';
import { Breakpoint } from '../../../../theme/media';
import { RoutesConfig } from '../../../../app/config/routes';
import { getRelayEnv } from '../../../../tests/utils/relay';
import { currentUserFactory } from '../../../../mocks/factories';
import { Role } from '../../../../modules/auth/auth.types';

const mockGetActiveBreakpoint = jest.fn().mockReturnValue(Breakpoint.DESKTOP);
jest.mock('../../../../theme/media', () => {
  return {
    ...jest.requireActual<NodeModule>('../../../../theme/media'),
    getActiveBreakpoint: () => mockGetActiveBreakpoint(),
  };
});

describe('Layout: Component', () => {
  const homeRoutePath = ['home'];
  const privacyPolicyPlaceholder = 'PP placeholder';

  const Component = ({ routeKey = homeRoutePath }) => (
    <Routes>
      <Route
        path={RoutesConfig.getLocalePath(routeKey)}
        element={
          <Layout>
            <span data-testid="content" />
          </Layout>
        }
      />
      <Route
        path={RoutesConfig.getLocalePath(['privacyPolicy'])}
        element={
          <Layout>
            <span>{privacyPolicyPlaceholder}</span>
          </Layout>
        }
      />
    </Routes>
  );

  describe('on mobile', () => {
    beforeEach(() => {
      mockGetActiveBreakpoint.mockReturnValue(Breakpoint.MOBILE);
    });

    describe('on /auth routes', () => {
      it('should not show open menu button', () => {
        const authPath = ['login'];
        const routerHistory = createMockRouterHistory(authPath);
        render(<Component routeKey={authPath} />, { routerHistory });
        expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
      });
    });

    it('should show content', () => {
      const relayEnvironment = getRelayEnv();
      const routerHistory = createMockRouterHistory(homeRoutePath);
      render(<Component />, { relayEnvironment, routerHistory });
      expect(screen.getByTestId('content')).toBeVisible();
    });

    describe('user is logged out', () => {
      it('should show open menu button', () => {
        const routerHistory = createMockRouterHistory(homeRoutePath);
        render(<Component />, { routerHistory });
        expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
      });

      it('should show privacy menu link', () => {
        const routerHistory = createMockRouterHistory(homeRoutePath);
        render(<Component />, { routerHistory });
        expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
      });

      it('should not show dashboard menu link', () => {
        const routerHistory = createMockRouterHistory(homeRoutePath);
        render(<Component />, { routerHistory });
        expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
      });
    });

    describe('user is logged in', () => {
      it('should show open menu button', () => {
        const routerHistory = createMockRouterHistory(homeRoutePath);
        render(<Component />, { routerHistory });
        expect(screen.getByLabelText(/open menu/i)).toBeVisible();
      });

      it('should not show menu links', () => {
        const routerHistory = createMockRouterHistory(homeRoutePath);
        render(<Component />, { routerHistory });
        expect(screen.queryByText(/privacy policy/i)).not.toBeVisible();
      });

      describe('user opens the menu', () => {
        it('should show menu links', async () => {
          const relayEnvironment = getRelayEnv(
            currentUserFactory({
              roles: [Role.USER],
            })
          );
          const routerHistory = createMockRouterHistory(homeRoutePath);
          render(<Component />, { relayEnvironment, routerHistory });
          await userEvent.click(screen.getByLabelText(/open menu/i));
          await userEvent.click(screen.getByText(/privacy policy/i));
          expect(screen.getByText(privacyPolicyPlaceholder)).toBeInTheDocument();
        });

        it('should close the menu when link is clicked', async () => {
          const relayEnvironment = getRelayEnv(
            currentUserFactory({
              roles: [Role.USER],
            })
          );
          const routerHistory = createMockRouterHistory(homeRoutePath);
          render(<Component />, { relayEnvironment, routerHistory });
          await userEvent.click(screen.getByLabelText(/open menu/i));
          await userEvent.click(screen.getByText(/privacy policy/i));
          expect(screen.queryByText(/privacy policy/i)).not.toBeVisible();
        });

        it('should close the menu when close icon is clicked', async () => {
          const relayEnvironment = getRelayEnv(
            currentUserFactory({
              roles: [Role.USER],
            })
          );
          const routerHistory = createMockRouterHistory(homeRoutePath);
          render(<Component />, { relayEnvironment, routerHistory });
          await userEvent.click(screen.getByLabelText(/open menu/i));
          await userEvent.click(screen.getByLabelText(/close menu/i));
          expect(screen.queryByText(/privacy policy/i)).not.toBeVisible();
        });
      });
    });
  });

  describe('on desktop', () => {
    beforeEach(() => {
      mockGetActiveBreakpoint.mockReturnValue(Breakpoint.DESKTOP);
    });

    it('should show content', () => {
      const routerHistory = createMockRouterHistory(homeRoutePath);
      render(<Component />, { routerHistory });
      expect(screen.getByTestId('content')).toBeVisible();
    });

    describe('on /auth routes', () => {
      it('should not show menu links', () => {
        const authPath = ['login'];
        const routerHistory = createMockRouterHistory(authPath);
        render(<Component routeKey={authPath} />, { routerHistory });
        expect(screen.queryByText(/privacy policy/i)).not.toBeInTheDocument();
      });
    });

    describe('user is logged out', () => {
      it('should not show open menu button', () => {
        const routerHistory = createMockRouterHistory(homeRoutePath);
        render(<Component />, { routerHistory });
        expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
      });

      it('should show menu links', () => {
        const routerHistory = createMockRouterHistory(homeRoutePath);
        render(<Component />, { routerHistory });
        expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
      });
    });

    describe('user is logged in', () => {
      it('should not show open menu button', () => {
        const routerHistory = createMockRouterHistory(homeRoutePath);
        render(<Component />, { routerHistory });
        expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
      });

      it('should show menu links', async () => {
        const relayEnvironment = getRelayEnv(
          currentUserFactory({
            roles: [Role.USER],
          })
        );
        const routerHistory = createMockRouterHistory(homeRoutePath);
        render(<Component />, { relayEnvironment, routerHistory });
        await userEvent.click(screen.getByText(/privacy policy/i));
        expect(screen.getByText(privacyPolicyPlaceholder)).toBeInTheDocument();
      });
    });
  });
});

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { append } from 'ramda';
import { Route, Routes } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import {
  currentUserFactory,
  fillNotificationsListQuery,
  fillNotificationsSubscriptionQuery,
  notificationFactory,
} from '../../../../mocks/factories';
import { Role } from '../../../../modules/auth/auth.types';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { Breakpoint } from '../../../../theme/media';
import { fillCommonQueryWithUser } from '../../../utils/commonQuery';
import { Layout } from '../layout.component';

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
      it('should not show open menu button', async () => {
        const authPath = ['login'];
        const routerProps = createMockRouterProps(authPath);
        const apolloMocks = append(
          fillNotificationsSubscriptionQuery([notificationFactory()], { hasUnreadNotifications: true })
        );

        render(<Component routeKey={authPath} />, { routerProps, apolloMocks });
        expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
      });
    });

    it('should show content', async () => {
      const routerProps = createMockRouterProps(homeRoutePath);
      const apolloMocks = append(
        fillNotificationsSubscriptionQuery([notificationFactory()], { hasUnreadNotifications: true })
      );
      render(<Component />, { routerProps, apolloMocks });
      expect(await screen.findByTestId('content')).toBeVisible();
    });

    describe('user is logged out', () => {
      it('should show open menu button', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationsSubscriptionQuery([notificationFactory()], { hasUnreadNotifications: true })
        );
        render(<Component />, { routerProps, apolloMocks });
        expect(await screen.findByLabelText(/open menu/i)).toBeInTheDocument();
      });

      it('should show privacy menu link', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationsSubscriptionQuery([notificationFactory()], { hasUnreadNotifications: true })
        );
        render(<Component />, { routerProps, apolloMocks });
        expect(await screen.findByText(/privacy policy/i)).toBeInTheDocument();
      });

      it('should not show dashboard menu link', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationsSubscriptionQuery([notificationFactory()], { hasUnreadNotifications: true })
        );

        render(<Component />, { routerProps, apolloMocks });
        expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
      });
    });

    describe('user is logged in', () => {
      it('should show open menu button', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationsSubscriptionQuery([notificationFactory()], { hasUnreadNotifications: true })
        );
        render(<Component />, { routerProps, apolloMocks });
        expect(await screen.findByLabelText(/open menu/i)).toBeVisible();
      });

      it('should not show menu links', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationsSubscriptionQuery([notificationFactory()], { hasUnreadNotifications: true })
        );
        const { waitForApolloMocks } = render(<Component />, { routerProps, apolloMocks });
        await waitForApolloMocks(0);
        expect(screen.queryByText(/privacy policy/i)).not.toBeVisible();
      });

      describe('user opens the menu', () => {
        it('should show menu links', async () => {
          const routerProps = createMockRouterProps(homeRoutePath);
          const apolloMocks = [
            fillCommonQueryWithUser(
              currentUserFactory({
                roles: [Role.USER],
              })
            ),
            fillNotificationsListQuery([], { hasUnreadNotifications: true }),
            fillNotificationsSubscriptionQuery([notificationFactory()], {
              hasUnreadNotifications: true,
            }),
          ];
          render(<Component />, { apolloMocks, routerProps });
          await userEvent.click(await screen.findByLabelText(/open menu/i));
          await userEvent.click(screen.getByText(/privacy policy/i));
          expect(screen.getByText(privacyPolicyPlaceholder)).toBeInTheDocument();
        });

        it('should close the menu when link is clicked', async () => {
          const routerProps = createMockRouterProps(homeRoutePath);
          const apolloMocks = [
            fillCommonQueryWithUser(
              currentUserFactory({
                roles: [Role.USER],
              })
            ),
            fillNotificationsListQuery([], { hasUnreadNotifications: true }),
            fillNotificationsSubscriptionQuery([notificationFactory()], {
              hasUnreadNotifications: true,
            }),
          ];
          render(<Component />, { apolloMocks, routerProps });
          await userEvent.click(await screen.findByLabelText(/open menu/i));
          await userEvent.click(screen.getByText(/privacy policy/i));
          expect(screen.queryByText(/privacy policy/i)).not.toBeVisible();
        });

        it('should close the menu when close icon is clicked', async () => {
          const routerProps = createMockRouterProps(homeRoutePath);
          const apolloMocks = [
            fillCommonQueryWithUser(
              currentUserFactory({
                roles: [Role.USER],
              })
            ),
            fillNotificationsListQuery([], { hasUnreadNotifications: true }),
            fillNotificationsSubscriptionQuery([notificationFactory()], {
              hasUnreadNotifications: true,
            }),
          ];
          render(<Component />, { apolloMocks, routerProps });
          await userEvent.click(await screen.findByLabelText(/open menu/i));
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

    it('should show content', async () => {
      const routerProps = createMockRouterProps(homeRoutePath);
      const apolloMocks = append(
        fillNotificationsSubscriptionQuery([notificationFactory()], { hasUnreadNotifications: true })
      );
      render(<Component />, { routerProps, apolloMocks });
      expect(await screen.findByTestId('content')).toBeVisible();
    });

    describe('on /auth routes', () => {
      it('should not show menu links', async () => {
        const authPath = ['login'];
        const routerProps = createMockRouterProps(authPath);
        const apolloMocks = append(
          fillNotificationsSubscriptionQuery([notificationFactory()], { hasUnreadNotifications: true })
        );

        render(<Component routeKey={authPath} />, { routerProps, apolloMocks });
        expect(screen.queryByText(/privacy policy/i)).not.toBeInTheDocument();
      });
    });

    describe('user is logged out', () => {
      it('should not show open menu button', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationsSubscriptionQuery([notificationFactory()], { hasUnreadNotifications: true })
        );
        render(<Component />, { routerProps, apolloMocks });

        expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
      });

      it('should show menu links', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationsSubscriptionQuery([notificationFactory()], { hasUnreadNotifications: true })
        );
        render(<Component />, { routerProps, apolloMocks });
        expect(await screen.findByText(/privacy policy/i)).toBeInTheDocument();
      });
    });

    describe('user is logged in', () => {
      it('should not show open menu button', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationsSubscriptionQuery([notificationFactory()], { hasUnreadNotifications: true })
        );
        render(<Component />, { routerProps, apolloMocks });

        expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
      });

      it('should show menu links', async () => {
        const apolloMocks = [
          fillCommonQueryWithUser(
            currentUserFactory({
              roles: [Role.USER],
            })
          ),
          fillNotificationsListQuery([], { hasUnreadNotifications: true }),
          fillNotificationsSubscriptionQuery([notificationFactory()], {
            hasUnreadNotifications: true,
          }),
        ];
        const routerProps = createMockRouterProps(homeRoutePath);
        render(<Component />, { apolloMocks, routerProps });
        await userEvent.click(await screen.findByText(/privacy policy/i));
        expect(screen.getByText(privacyPolicyPlaceholder)).toBeInTheDocument();
      });
    });
  });
});

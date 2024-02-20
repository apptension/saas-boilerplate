import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { media } from '@sb/webapp-core/theme';
import { getLocalePath } from '@sb/webapp-core/utils';
import {
  fillNotificationCreatedSubscriptionQuery,
  fillNotificationsListQuery,
  notificationFactory,
} from '@sb/webapp-notifications/tests/factories';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { append } from 'ramda';
import { Route, Routes } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { Role } from '../../../../modules/auth/auth.types';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { Layout } from '../layout.component';

const mockGetActiveBreakpoint = jest.fn().mockReturnValue(media.Breakpoint.DESKTOP);
jest.mock('@sb/webapp-core/theme', () => {
  const requireActual = jest.requireActual('@sb/webapp-core/theme');
  return {
    ...requireActual,
    media: {
      ...requireActual.media,
      getActiveBreakpoint: () => mockGetActiveBreakpoint(),
    },
  };
});

describe('Layout: Component', () => {
  const homeRoutePath = RoutesConfig.home;
  const privacyPolicyPlaceholder = 'PP placeholder';

  const Component = ({ routeKey = homeRoutePath }) => (
    <Routes>
      <Route
        path={getLocalePath(routeKey)}
        element={
          <Layout>
            <span data-testid="content" />
          </Layout>
        }
      />
      <Route
        path={getLocalePath(RoutesConfig.privacyPolicy)}
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
      mockGetActiveBreakpoint.mockReturnValue(media.Breakpoint.MOBILE);
    });

    describe('on /auth routes', () => {
      it('should not show open menu button', async () => {
        const authPath = RoutesConfig.login;
        const routerProps = createMockRouterProps(authPath);
        const apolloMocks = append(
          fillNotificationCreatedSubscriptionQuery(notificationFactory())
        );

        render(<Component routeKey={authPath} />, { routerProps, apolloMocks });
        expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
      });
    });

    it('should show content', async () => {
      const routerProps = createMockRouterProps(homeRoutePath);
      const apolloMocks = append(fillNotificationCreatedSubscriptionQuery(notificationFactory()));
      render(<Component />, { routerProps, apolloMocks });
      expect(await screen.findByTestId('content')).toBeVisible();
    });

    describe('user is logged out', () => {
      it('should show open menu button', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationCreatedSubscriptionQuery(notificationFactory())
        );
        render(<Component />, { routerProps, apolloMocks });
        expect(await screen.findByLabelText(/open menu/i)).toBeInTheDocument();
      });

      it('should show privacy menu link', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationCreatedSubscriptionQuery(notificationFactory())
        );
        render(<Component />, { routerProps, apolloMocks });
        expect(await screen.findByText(/privacy policy/i)).toBeInTheDocument();
      });

      it('should not show dashboard menu link', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationCreatedSubscriptionQuery(notificationFactory())
        );

        render(<Component />, { routerProps, apolloMocks });
        expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
      });
    });

    describe('user is logged in', () => {
      it('should show open menu button', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationCreatedSubscriptionQuery(notificationFactory())
        );
        render(<Component />, { routerProps, apolloMocks });
        expect(await screen.findByLabelText(/open menu/i)).toBeVisible();
      });

      it('should not show menu links', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationCreatedSubscriptionQuery(notificationFactory())
        );
        const { waitForApolloMocks } = render(<Component />, { routerProps, apolloMocks });
        await waitForApolloMocks(0);
        expect(screen.getByLabelText(/close menu/i).classList).toContain('opacity-0');
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
            fillNotificationCreatedSubscriptionQuery(notificationFactory()),
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
            fillNotificationCreatedSubscriptionQuery(notificationFactory()),
          ];
          render(<Component />, { apolloMocks, routerProps });
          await userEvent.click(await screen.findByLabelText(/open menu/i));
          const closeBtn = screen.getByLabelText(/close menu/i);
          expect(closeBtn.classList).not.toContain('opacity-0');
          await userEvent.click(screen.getByText(/privacy policy/i));
          expect(closeBtn.classList).toContain('opacity-0');
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
            fillNotificationCreatedSubscriptionQuery(notificationFactory()),
          ];
          render(<Component />, { apolloMocks, routerProps });
          await userEvent.click(await screen.findByLabelText(/open menu/i));
          const closeBtn = screen.getByLabelText(/close menu/i);
          await userEvent.click(closeBtn);
          expect(closeBtn.classList).toContain('opacity-0');
        });
      });
    });
  });

  describe('on desktop', () => {
    beforeEach(() => {
      mockGetActiveBreakpoint.mockReturnValue(media.Breakpoint.DESKTOP);
    });

    it('should show content', async () => {
      const routerProps = createMockRouterProps(homeRoutePath);
      const apolloMocks = append(
        fillNotificationCreatedSubscriptionQuery(notificationFactory())
      );
      render(<Component />, { routerProps, apolloMocks });
      expect(await screen.findByTestId('content')).toBeVisible();
    });

    describe('on /auth routes', () => {
      it('should not show menu links', async () => {
        const authPath = RoutesConfig.login;
        const routerProps = createMockRouterProps(authPath);
        const apolloMocks = append(
          fillNotificationCreatedSubscriptionQuery(notificationFactory())
        );

        render(<Component routeKey={authPath} />, { routerProps, apolloMocks });
        expect(screen.queryByText(/privacy policy/i)).not.toBeInTheDocument();
      });
    });

    describe('user is logged out', () => {
      it('should not show open menu button', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationCreatedSubscriptionQuery(notificationFactory())
        );
        render(<Component />, { routerProps, apolloMocks });

        expect(screen.queryByLabelText(/open menu/i)).not.toBeInTheDocument();
      });

      it('should show menu links', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationCreatedSubscriptionQuery(notificationFactory())
        );
        render(<Component />, { routerProps, apolloMocks });
        expect(await screen.findByText(/privacy policy/i)).toBeInTheDocument();
      });
    });

    describe('user is logged in', () => {
      it('should not show open menu button', async () => {
        const routerProps = createMockRouterProps(homeRoutePath);
        const apolloMocks = append(
          fillNotificationCreatedSubscriptionQuery(notificationFactory())
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
          fillNotificationCreatedSubscriptionQuery(notificationFactory()),
        ];
        const routerProps = createMockRouterProps(homeRoutePath);
        render(<Component />, { apolloMocks, routerProps });
        await userEvent.click(await screen.findByText(/privacy policy/i));
        expect(screen.getByText(privacyPolicyPlaceholder)).toBeInTheDocument();
      });
    });
  });
});

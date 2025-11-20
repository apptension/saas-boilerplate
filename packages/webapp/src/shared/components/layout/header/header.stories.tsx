import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import {
  fillNotificationCreatedSubscriptionQuery,
  fillNotificationsListQuery,
  notificationFactory,
} from '@sb/webapp-notifications/tests/factories';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { useMemo } from 'react';

import { withProviders } from '../../../utils/storybook';
import { LayoutContext } from '../layout.context';
import { Header } from './header.component';

const Template: StoryFn<{ isLoggedIn?: boolean }> = ({ isLoggedIn = false }) => {
  const value = useMemo(
    () => ({
      isSidebarAvailable: true,
      isSideMenuOpen: false,
      isSidebarCollapsed: false,
      setSideMenuOpen: () => null,
      setSidebarCollapsed: () => null,
      toggleSidebar: () => null,
    }),
    []
  );

  return (
    <LayoutContext.Provider value={value}>
      <Header />
    </LayoutContext.Provider>
  );
};

const meta: Meta<typeof Template> = {
  title: 'Shared/Layout/Header',
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks, { args: { isLoggedIn = false } }: any) => {
        return [
          fillCommonQueryWithUser(isLoggedIn ? currentUserFactory() : null),
          fillNotificationsListQuery([], { hasUnreadNotifications: false }),
          fillNotificationCreatedSubscriptionQuery(notificationFactory()),
        ];
      },
    }),
  ],
};

export default meta;

export const LoggedOut: StoryObj<typeof meta> = {
  render: Template,
  args: { isLoggedIn: false },
};

export const LoggedIn: StoryObj<typeof meta> = {
  render: Template,
  args: { isLoggedIn: true },
};

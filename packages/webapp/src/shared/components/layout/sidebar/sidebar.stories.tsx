import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { useMemo } from 'react';

import { withProviders } from '../../../utils/storybook';
import { LayoutContext } from '../layout.context';
import { Sidebar } from './sidebar.component';

const Template: StoryFn<{ isLoggedIn?: boolean; isCollapsed?: boolean }> = ({
  isLoggedIn = true,
  isCollapsed = false,
}) => {
  const value = useMemo(
    () => ({
      isSidebarAvailable: true,
      isSideMenuOpen: true,
      isSidebarCollapsed: isCollapsed,
      setSideMenuOpen: () => null,
      setSidebarCollapsed: () => null,
      toggleSidebar: () => null,
    }),
    [isCollapsed]
  );

  return (
    <LayoutContext.Provider value={value}>
      <Sidebar />
    </LayoutContext.Provider>
  );
};

const meta: Meta<typeof Template> = {
  title: 'Shared/Layout/Sidebar',
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks, { args: { isLoggedIn = true } }: any) => {
        return [fillCommonQueryWithUser(isLoggedIn ? currentUserFactory() : null)];
      },
    }),
  ],
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
  args: { isLoggedIn: true, isCollapsed: false },
};

export const Collapsed: StoryObj<typeof meta> = {
  render: Template,
  args: { isLoggedIn: true, isCollapsed: true },
};

export const LoggedOut: StoryObj<typeof meta> = {
  render: Template,
  args: { isLoggedIn: false, isCollapsed: false },
};

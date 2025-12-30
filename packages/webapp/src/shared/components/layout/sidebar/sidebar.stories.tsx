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
  render: Template as any,
  args: { isLoggedIn: true, isCollapsed: false } as any,
};

export const Collapsed: StoryObj<typeof meta> = {
  render: Template as any,
  args: { isLoggedIn: true, isCollapsed: true } as any,
};

export const LoggedOut: StoryObj<typeof meta> = {
  render: Template as any,
  args: { isLoggedIn: false, isCollapsed: false } as any,
};

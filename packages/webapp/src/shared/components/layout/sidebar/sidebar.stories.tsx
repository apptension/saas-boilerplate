import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { useMemo } from 'react';

import { withProviders } from '../../../utils/storybook';
import { LayoutContext } from '../layout.context';
import { Sidebar } from './sidebar.component';

const Template: StoryFn = () => {
  const value = useMemo(
    () => ({
      isSidebarAvailable: true,
      isSideMenuOpen: true,
      setSideMenuOpen: () => null,
    }),
    []
  );

  return (
    <LayoutContext.Provider value={value}>
      <Sidebar />
    </LayoutContext.Provider>
  );
};

const meta: Meta = {
  title: 'Shared/Layout/Sidebar',
  component: Sidebar,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
  args: {},
  decorators: [withProviders({})],
};

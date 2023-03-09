import { Story } from '@storybook/react';
import { useMemo } from 'react';

import { withProviders } from '../../../utils/storybook';
import { LayoutContext } from '../layout.context';
import { Sidebar } from './sidebar.component';

const Template: Story = () => {
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

export default {
  title: 'Shared/Layout/Sidebar',
  component: Sidebar,
};

export const Default = Template.bind({});
Default.args = {};
Default.decorators = [withProviders({})];

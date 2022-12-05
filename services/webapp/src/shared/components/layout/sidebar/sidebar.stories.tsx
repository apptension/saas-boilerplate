import { Story } from '@storybook/react';
import { LayoutContext } from '../layout.context';
import { withProviders } from '../../../utils/storybook';
import { Sidebar } from './sidebar.component';

const Template: Story = () => {
  return (
    <LayoutContext.Provider value={{ isSidebarAvailable: true, isSideMenuOpen: true, setSideMenuOpen: () => null }}>
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

import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../../utils/testUtils';
import { LayoutContext } from '../layout.context';
import { Sidebar } from './sidebar.component';

const Template: Story = () => {
  return (
    <ProvidersWrapper>
      <LayoutContext.Provider value={{ isSidebarAvailable: true, isSideMenuOpen: true, setSideMenuOpen: () => null }}>
        <Sidebar />
      </LayoutContext.Provider>
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Layout/Sidebar',
  component: Sidebar,
};

export const Default = Template.bind({});
Default.args = {};

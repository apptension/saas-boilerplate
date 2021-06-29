import { Story } from '@storybook/react';
import { ProvidersWrapper } from '../../utils/testUtils';
import { LayoutContext } from '../../../routes/layout/layout.context';
import { Sidebar } from './sidebar.component';

const Template: Story = (args) => {
  return (
    <ProvidersWrapper>
      <LayoutContext.Provider value={{ isSidebarAvailable: true, isSideMenuOpen: true, setSideMenuOpen: () => null }}>
        <Sidebar {...args} />
      </LayoutContext.Provider>
    </ProvidersWrapper>
  );
};

export default {
  title: 'Shared/Sidebar',
  component: Sidebar,
};

export const Default = Template.bind({});
Default.args = {};

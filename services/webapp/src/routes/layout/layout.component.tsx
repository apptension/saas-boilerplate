import React, { ReactNode, useState } from 'react';

import { useSelector } from 'react-redux';
import { selectIsLoggedIn } from '../../modules/auth/auth.selectors';
import { Header, Sidebar, Content } from './layout.styles';
import { LayoutContext } from './layout.context';

export interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isUserLoggedIn = useSelector(selectIsLoggedIn);
  const [isSideMenuOpen, setSideMenuOpen] = useState(false);

  return (
    <LayoutContext.Provider value={{ isSideMenuOpen, setSideMenuOpen }}>
      <Header />
      {isUserLoggedIn && <Sidebar />}
      <Content withSidebar={isUserLoggedIn}>{children}</Content>
    </LayoutContext.Provider>
  );
};

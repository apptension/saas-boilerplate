import React, { ReactNode, useMemo, useState } from 'react';

import { useLocation, matchPath } from 'react-router-dom';
import { isNil } from 'ramda';
import { NO_NAVIGATION_ROUTES } from '../app.constants';
import { Header, Sidebar, Content } from './layout.styles';
import { LayoutContext } from './layout.context';

export interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isSideMenuOpen, setSideMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const shouldHideSidebar = useMemo(
    () => NO_NAVIGATION_ROUTES.some((routePath) => !isNil(matchPath(pathname, { path: `/:lang${routePath}` }))),
    [pathname]
  );

  return (
    <LayoutContext.Provider value={{ isSidebarAvailable: !shouldHideSidebar, isSideMenuOpen, setSideMenuOpen }}>
      <Header />
      {!shouldHideSidebar && <Sidebar />}
      <Content withSidebar={!shouldHideSidebar}>{children}</Content>
    </LayoutContext.Provider>
  );
};

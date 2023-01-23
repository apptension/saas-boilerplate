import { ReactNode, useMemo, useState } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { isNil } from 'ramda';
import { NO_NAVIGATION_ROUTES } from '../../../app/config/routes';
import { Header, Sidebar, Content } from './layout.styles';
import { LayoutContext } from './layout.context';

export type LayoutProps = {
  children?: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  const [isSideMenuOpen, setSideMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const shouldDisplaySidebar = useMemo(
    () => NO_NAVIGATION_ROUTES.every((path) => isNil(matchPath({ path }, pathname))),
    [pathname]
  );

  return (
    <LayoutContext.Provider value={{ isSidebarAvailable: shouldDisplaySidebar, isSideMenuOpen, setSideMenuOpen }}>
      <Header />
      {shouldDisplaySidebar && <Sidebar />}
      <Content withSidebar={shouldDisplaySidebar}>{children}</Content>
    </LayoutContext.Provider>
  );
};

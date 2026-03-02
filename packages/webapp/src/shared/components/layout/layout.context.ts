import { createContext } from 'react';

type LayoutContextData = {
  isSideMenuOpen: boolean;
  isSidebarAvailable: boolean;
  isSidebarCollapsed: boolean;
  setSideMenuOpen: (isOpen: boolean) => void;
  setSidebarCollapsed: (isCollapsed: boolean) => void;
  toggleSidebar: () => void;
};

export const LayoutContext = createContext<LayoutContextData>({
  isSideMenuOpen: false,
  setSideMenuOpen: () => null,
  isSidebarAvailable: false,
  isSidebarCollapsed: false,
  setSidebarCollapsed: () => null,
  toggleSidebar: () => null,
});

import { createContext } from 'react';

type LayoutContextData = {
  isSideMenuOpen: boolean;
  isSidebarAvailable: boolean;
  setSideMenuOpen: (isOpen: boolean) => void;
};

export const LayoutContext = createContext<LayoutContextData>({
  isSideMenuOpen: false,
  setSideMenuOpen: () => null,
  isSidebarAvailable: false,
});

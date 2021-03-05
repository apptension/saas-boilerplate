import { createContext } from 'react';

interface LayoutContextData {
  isSideMenuOpen: boolean;
  setSideMenuOpen: (isOpen: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextData>({
  isSideMenuOpen: false,
  setSideMenuOpen: () => null,
});

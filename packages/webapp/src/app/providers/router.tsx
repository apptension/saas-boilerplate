import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

export const RouterProvider = ({ children }: { children: ReactNode }) => (
  <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>{children}</BrowserRouter>
);

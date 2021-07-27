import { ReactNode } from 'react';
import { Router } from 'react-router';
import { browserHistory } from '../../shared/utils/history';

export const RouterProvider = ({ children }: { children: ReactNode }) => (
  <Router history={browserHistory}>{children}</Router>
);

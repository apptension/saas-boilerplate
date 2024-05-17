import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { useAuth } from '../../../hooks';

/**
 * Renders route only for anonymous users
 *
 * @constructor
 * @category Component
 *
 * @example
 * Example route configuration using `AnonymousRoute` component:
 * ```tsx showLineNumbers
 * <Route path="/" element={<AnonymousRoute />}>
 *   <Route index element={<span>Page accessible only anonymous users</span>} />
 * </Route>
 * ```
 */
export const AnonymousRoute = () => {
  const generateLocalePath = useGenerateLocalePath();
  const { isLoggedIn } = useAuth();
  const [search] = useSearchParams();
  const redirect = search.get('redirect');

  return isLoggedIn ? <Navigate to={redirect ?? generateLocalePath(RoutesConfig.home)} /> : <Outlet />;
};

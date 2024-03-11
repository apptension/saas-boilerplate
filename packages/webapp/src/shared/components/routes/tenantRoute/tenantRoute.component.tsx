import { CurrentTenant } from '@sb/webapp-api-client/providers';

import { AuthRoute } from '../authRoute';

/**
 * TODO Add documentation
 * @constructor
 */
export const TenantRoute = () => {
  return (
    <CurrentTenant>
      <AuthRoute />
    </CurrentTenant>
  );
};

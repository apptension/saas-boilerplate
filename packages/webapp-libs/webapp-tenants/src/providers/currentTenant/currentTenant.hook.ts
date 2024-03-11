import { useContext } from 'react';

import currentTenantContext from './currentTenant.context';

/**
 * @category hook
 */
export const useCurrentTenant = () => {
  return useContext(currentTenantContext);
};

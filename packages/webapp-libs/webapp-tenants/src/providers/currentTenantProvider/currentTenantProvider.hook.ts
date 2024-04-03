import { useContext } from 'react';

import currentTenantContext from './currentTenantProvider.context';

/**
 * @category hook
 */
export const useCurrentTenant = () => {
  return useContext(currentTenantContext);
};

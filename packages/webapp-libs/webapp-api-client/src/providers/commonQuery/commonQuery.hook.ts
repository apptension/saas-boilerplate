import { useContext } from 'react';

import commonDataContext from './commonQuery.context';

/**
 * @category hook
 */
export const useCommonQuery = () => {
  return useContext(commonDataContext);
};

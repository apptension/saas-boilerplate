import { useContext } from 'react';

import commonDataContext from './commonQuery.context';

export const useCommonQuery = () => {
  return useContext(commonDataContext);
};

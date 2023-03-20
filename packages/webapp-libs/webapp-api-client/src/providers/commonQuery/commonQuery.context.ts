import { createContext } from 'react';

import { CommonQueryCurrentUserQueryQuery } from '../../graphql';

type CommonDataContext = {
  data: CommonQueryCurrentUserQueryQuery | null;
  reload: () => void;
};

export default createContext<CommonDataContext>({
  data: null,
  reload: () => {
    return;
  },
});

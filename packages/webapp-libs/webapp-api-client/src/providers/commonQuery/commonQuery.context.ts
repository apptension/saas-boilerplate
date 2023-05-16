import React from 'react';

import { CommonQueryCurrentUserQueryQuery } from '../../graphql';

type CommonDataContext = {
  data: CommonQueryCurrentUserQueryQuery | null;
  reload: () => void;
};

export default React.createContext<CommonDataContext>({
  data: null,
  reload: () => {
    return;
  },
});

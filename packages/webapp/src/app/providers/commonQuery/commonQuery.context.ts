import { CommonQueryCurrentUserQueryQuery } from '@sb/webapp-api-client/graphql';
import { createContext } from 'react';

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

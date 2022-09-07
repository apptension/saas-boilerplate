import { createContext } from 'react';
import { PreloadedQuery } from 'react-relay';
import { ConcreteRequest } from 'relay-runtime';
import { commonQueryCurrentUserQuery } from './__generated__/commonQueryCurrentUserQuery.graphql';

type CommonDataContext = {
  currentUserQueryRef: PreloadedQuery<commonQueryCurrentUserQuery> | null;
  currentUserQuery: ConcreteRequest | null;
  reload: () => void;
};

export default createContext<CommonDataContext>({
  currentUserQueryRef: null,
  currentUserQuery: null,
  reload: () => {
    return;
  },
});

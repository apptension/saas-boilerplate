import { createContext } from 'react';
import { CommonQueryCurrentUserQueryQuery } from '../../../shared/services/graphqlApi/__generated/gql/graphql';

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

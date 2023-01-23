import { ReactNode } from 'react';
import { ApolloProvider as Provider } from '@apollo/client';

import { client } from '../../shared/services/graphqlApi/apolloClient';

export const ApolloProvider = ({ children }: { children: ReactNode }) => (
  <Provider client={client}>{children}</Provider>
);

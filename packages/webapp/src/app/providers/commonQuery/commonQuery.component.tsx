import React, { FunctionComponent, PropsWithChildren, useCallback } from 'react';
import { useQuery } from '@apollo/client';

import commonDataContext from './commonQuery.context';
import { commonQueryCurrentUserQuery } from './commonQuery.graphql';

export const CommonQuery: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const { loading, data, refetch } = useQuery(commonQueryCurrentUserQuery, { nextFetchPolicy: 'network-only' });

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (loading || !data) {
    return null;
  }

  return (
    <commonDataContext.Provider
      value={{
        data,
        reload,
      }}
    >
      {children}
    </commonDataContext.Provider>
  );
};

import { useQuery } from '@apollo/client';
import React, { FunctionComponent, PropsWithChildren, useCallback, useMemo } from 'react';

import commonDataContext from './commonQuery.context';
import { commonQueryCurrentUserQuery } from './commonQuery.graphql';

export const CommonQuery: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const { loading, data, refetch } = useQuery(commonQueryCurrentUserQuery, { nextFetchPolicy: 'network-only' });

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = useMemo(() => ({ data: data || null, reload }), [data, reload]);

  if (loading || !data) {
    return null;
  }

  return <commonDataContext.Provider value={value}>{children}</commonDataContext.Provider>;
};

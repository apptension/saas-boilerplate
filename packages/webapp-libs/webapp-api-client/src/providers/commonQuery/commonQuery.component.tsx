import { useQuery } from '@apollo/client';
import { setUserId } from '@sb/webapp-core/services/analytics';
import { PropsWithChildren, useCallback, useEffect, useMemo } from 'react';

import { CurrentUserType } from '../../graphql';
import commonDataContext from './commonQuery.context';
import { commonQueryCurrentUserQuery } from './commonQuery.graphql';

/**
 *
 * @param children
 * @constructor
 *
 * @category Component
 */
export const CommonQuery = ({ children }: PropsWithChildren) => {
  const { loading, data, refetch } = useQuery(commonQueryCurrentUserQuery, { nextFetchPolicy: 'network-only' });

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = useMemo(() => ({ data: data || null, reload }), [data, reload]);

  const userId = (data?.currentUser as CurrentUserType)?.id;

  useEffect(() => {
    userId && setUserId(userId);
  }, [userId]);

  if (loading || !data) {
    return null;
  }

  return <commonDataContext.Provider value={value}>{children}</commonDataContext.Provider>;
};

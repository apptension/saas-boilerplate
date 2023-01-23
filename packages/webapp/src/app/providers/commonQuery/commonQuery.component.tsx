import React, { FunctionComponent, PropsWithChildren, useCallback, useEffect } from 'react';
import { graphql } from 'react-relay';

import { useUnsuspendedQueryLoader } from '../../../shared/hooks/useUnsuspendedQueryLoader/useUnsuspendedQueryLoader';
import currentUserQuery, { commonQueryCurrentUserQuery } from './__generated__/commonQueryCurrentUserQuery.graphql';
import commonDataContext from './commonQuery.context';

graphql`
  fragment commonQueryCurrentUserFragment on CurrentUserType {
    id
    email
    firstName
    lastName
    roles
    avatar
  }
`;

export const CommonQuery: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [isCurrentUserQueryLoading, currentUserQueryRef, loadCurrentUserQuery] =
    useUnsuspendedQueryLoader<commonQueryCurrentUserQuery>(graphql`
      query commonQueryCurrentUserQuery {
        currentUser {
          ...commonQueryCurrentUserFragment
        }
      }
    `);

  useEffect(() => {
    loadCurrentUserQuery({});
  }, [loadCurrentUserQuery]);

  const reload = useCallback(() => {
    loadCurrentUserQuery({}, { fetchPolicy: 'network-only' });
  }, [loadCurrentUserQuery]);

  if (!currentUserQueryRef || isCurrentUserQueryLoading) {
    return null;
  }

  return (
    <commonDataContext.Provider
      value={{
        currentUserQueryRef,
        currentUserQuery,
        reload,
      }}
    >
      {children}
    </commonDataContext.Provider>
  );
};

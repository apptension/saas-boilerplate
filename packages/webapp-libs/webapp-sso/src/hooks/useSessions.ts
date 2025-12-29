import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@sb/webapp-api-client/graphql';

export const SESSIONS_QUERY = gql(`
  query SessionsQuery {
    mySessions(first: 50) {
      edges {
        node {
          id
          deviceName
          deviceType
          browser
          operatingSystem
          ipAddress
          location
          isActive
          isCurrent
          lastActivityAt
          expiresAt
          createdAt
        }
      }
    }
  }
`);

export const REVOKE_SESSION = gql(`
  mutation RevokeSession($sessionId: String!, $reason: String) {
    revokeSession(sessionId: $sessionId, reason: $reason) {
      ok
    }
  }
`);

export const REVOKE_ALL_SESSIONS = gql(`
  mutation RevokeAllSessions {
    revokeAllSessions {
      ok
      revokedCount
    }
  }
`);

export function useSessions() {
  const { data, loading, error, refetch } = useQuery(SESSIONS_QUERY);

  const [revokeSession] = useMutation(REVOKE_SESSION, {
    onCompleted: () => refetch(),
  });

  const [revokeAllSessions] = useMutation(REVOKE_ALL_SESSIONS, {
    onCompleted: () => refetch(),
  });

  return {
    sessions: data?.mySessions?.edges?.map((edge: any) => edge.node) || [],
    loading,
    error,
    refetch,
    revokeSession,
    revokeAllSessions,
  };
}


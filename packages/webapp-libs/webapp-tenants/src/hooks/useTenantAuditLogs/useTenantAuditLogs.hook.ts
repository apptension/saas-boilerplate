import { useQuery } from '@apollo/client/react';
import { gql } from '@sb/webapp-api-client/graphql';

const AUDIT_LOGS_QUERY = gql(`
  query TenantAuditLogsQuery(
    $eventType: String
    $userEmail: String
    $success: Boolean
    $startDate: String
    $endDate: String
    $search: String
    $first: Int
  ) {
    ssoAuditLogs(
      eventType: $eventType
      userEmail: $userEmail
      success: $success
      startDate: $startDate
      endDate: $endDate
      search: $search
      first: $first
    ) {
      edges {
        node {
          id
          eventType
          eventDescription
          userEmail
          connectionName
          ipAddress
          success
          errorMessage
          metadata
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`);

export function useTenantAuditLogs(filters: {
  eventType?: string;
  userEmail?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  first?: number;
}) {
  const { data, loading, error, refetch } = useQuery(AUDIT_LOGS_QUERY, {
    variables: {
      eventType: filters.eventType || undefined,
      userEmail: filters.userEmail || undefined,
      success: filters.success,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      search: filters.search || undefined,
      first: filters.first ?? 50,
    },
  });

  const edges = data?.ssoAuditLogs?.edges ?? [];
  const logs = edges
    .filter((edge): edge is { node: NonNullable<typeof edge>['node'] } => !!edge?.node)
    .map((edge) => edge.node!);
  const pageInfo = data?.ssoAuditLogs?.pageInfo;

  return {
    logs,
    pageInfo,
    loading,
    error,
    refetch,
  };
}

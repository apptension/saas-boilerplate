import { gql } from '@sb/webapp-api-client/graphql';

export const actionLogFragment = gql(/* GraphQL */ `
  fragment actionLogFragment on ActionLogType {
    id
    actionType
    entityType
    entityId
    entityName
    actorType
    actorEmail
    changes
    metadata
    createdAt
  }
`);

export const allActionLogsQuery = gql(/* GraphQL */ `
  query allActionLogsQuery(
    $tenantId: ID!
    $first: Int
    $after: String
    $entityType: String
    $actionType: String
    $actorEmail: String
    $fromDatetime: DateTime
    $toDatetime: DateTime
    $search: String
  ) {
    allActionLogs(
      tenantId: $tenantId
      first: $first
      after: $after
      entityType: $entityType
      actionType: $actionType
      actorEmail: $actorEmail
      fromDatetime: $fromDatetime
      toDatetime: $toDatetime
      search: $search
    ) {
      edges {
        node {
          ...actionLogFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`);

export const updateTenantActionLoggingMutation = gql(/* GraphQL */ `
  mutation updateTenantActionLoggingMutation($tenantId: ID!, $enabled: Boolean!) {
    updateTenantActionLogging(tenantId: $tenantId, enabled: $enabled) {
      tenant {
        id
        actionLoggingEnabled
      }
      ok
    }
  }
`);

export const exportActionLogsMutation = gql(/* GraphQL */ `
  mutation exportActionLogsMutation(
    $tenantId: ID!
    $entityType: String
    $actionType: String
    $actorEmail: String
    $fromDatetime: DateTime
    $toDatetime: DateTime
    $search: String
  ) {
    exportActionLogs(
      tenantId: $tenantId
      entityType: $entityType
      actionType: $actionType
      actorEmail: $actorEmail
      fromDatetime: $fromDatetime
      toDatetime: $toDatetime
      search: $search
    ) {
      export {
        id
        status
      }
      ok
    }
  }
`);

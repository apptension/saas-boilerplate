import { gql } from '@sb/webapp-api-client/graphql';

export const backupConfigQuery = gql(/* GraphQL */ `
  query backupConfigQuery($tenantId: ID!) {
    backupConfig(tenantId: $tenantId) {
      id
      enabled
      backupIntervalHours
      retentionDays
      emailRecipients
      selectedModules
      selectedModels
      excludedModels
    }
  }
`);

export const availableBackupModulesQuery = gql(/* GraphQL */ `
  query availableBackupModulesQuery($tenantId: ID!) {
    availableBackupModules(tenantId: $tenantId) {
      id
      name
      description
      modelCount
    }
  }
`);

export const availableBackupModelsQuery = gql(/* GraphQL */ `
  query availableBackupModelsQuery($tenantId: ID!, $moduleId: String!) {
    availableBackupModels(tenantId: $tenantId, moduleId: $moduleId) {
      appLabel
      modelName
      displayName
      fullName
    }
  }
`);

export const backupRecordsQuery = gql(/* GraphQL */ `
  query backupRecordsQuery($tenantId: ID!, $first: Int, $after: String) {
    backupRecords(tenantId: $tenantId, first: $first, after: $after) {
      edges {
        node {
          id
          filePath
          fileSize
          status
          errorMessage
          modelCounts
          createdAt
          downloadUrl
          isEncrypted
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const updateBackupConfigMutation = gql(/* GraphQL */ `
  mutation updateBackupConfigMutation($input: BackupConfigInput!) {
    updateBackupConfig(input: $input) {
      backupConfig {
        id
        enabled
        backupIntervalHours
        retentionDays
        emailRecipients
        selectedModules
        selectedModels
        excludedModels
      }
      ok
      error
    }
  }
`);

export const deleteBackupMutation = gql(/* GraphQL */ `
  mutation deleteBackupMutation($backupId: ID!) {
    deleteBackup(backupId: $backupId) {
      ok
      error
    }
  }
`);

export const triggerBackupMutation = gql(/* GraphQL */ `
  mutation triggerBackupMutation($tenantId: ID!) {
    triggerBackup(tenantId: $tenantId) {
      ok
      error
      backupId
    }
  }
`);

export const downloadBackupDecryptedMutation = gql(/* GraphQL */ `
  mutation downloadBackupDecryptedMutation($backupId: ID!) {
    downloadBackupDecrypted(backupId: $backupId) {
      ok
      content
      error
    }
  }
`);

export const restoreBackupMutation = gql(/* GraphQL */ `
  mutation restoreBackupMutation($backupId: ID!, $conflictStrategy: ConflictStrategyEnum!) {
    restoreBackup(backupId: $backupId, conflictStrategy: $conflictStrategy) {
      ok
      error
      restoreId
    }
  }
`);

export const backupEligibleRecipientsQuery = gql(/* GraphQL */ `
  query backupEligibleRecipientsQuery($tenantId: ID!) {
    backupEligibleRecipients(tenantId: $tenantId) {
      id
      userId
      firstName
      lastName
      userEmail
      invitationAccepted
    }
  }
`);

export const restoreRecordsQuery = gql(/* GraphQL */ `
  query restoreRecordsQuery($tenantId: ID!, $first: Int, $after: String) {
    restoreRecords(tenantId: $tenantId, first: $first, after: $after) {
      edges {
        node {
          id
          status
          conflictStrategy
          modelCounts
          errorMessage
          startedAt
          completedAt
          createdAt
          totalCreated
          totalUpdated
          totalSkipped
          totalFailed
          backupRecord {
            id
            createdAt
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

import { gql } from '@sb/webapp-api-client/graphql';

/**
 * Query to get all available permissions
 */
export const allPermissionsQuery = gql(/* GraphQL */ `
  query allPermissionsQuery {
    allPermissions {
      edges {
        node {
          id
          code
          name
          description
          category
          categoryLabel
          categoryDescription
          sortOrder
        }
      }
    }
  }
`);

/**
 * Query to get all organization roles for a tenant
 */
export const allOrganizationRolesQuery = gql(/* GraphQL */ `
  query allOrganizationRolesQuery($tenantId: ID!) {
    allOrganizationRoles(tenantId: $tenantId) {
      edges {
        node {
          id
          name
          description
          color
          systemRoleType
          isSystemRole
          isOwnerRole
          memberCount
          permissions {
            id
            code
            name
            category
          }
        }
      }
    }
  }
`);

/**
 * Query to get a single organization role
 */
export const organizationRoleQuery = gql(/* GraphQL */ `
  query organizationRoleQuery($id: ID!) {
    organizationRole(id: $id) {
      id
      name
      description
      color
      systemRoleType
      isSystemRole
      isOwnerRole
      memberCount
      permissions {
        id
        code
        name
        category
      }
    }
  }
`);

/**
 * Query to get current user's permissions in a tenant
 */
export const currentUserPermissionsQuery = gql(/* GraphQL */ `
  query currentUserPermissionsQuery($tenantId: ID!) {
    currentUserPermissions(tenantId: $tenantId)
  }
`);

/**
 * Query to get current user's organization roles in a tenant with their permissions
 */
export const currentUserOrganizationRolesQuery = gql(/* GraphQL */ `
  query currentUserOrganizationRolesQuery($tenantId: ID!) {
    currentUserOrganizationRoles(tenantId: $tenantId) {
      id
      name
      description
      color
      isSystemRole
      isOwnerRole
      permissions {
        id
        code
        name
        category
      }
    }
    currentUserPermissions(tenantId: $tenantId)
  }
`);

/**
 * Mutation to create a new organization role
 */
export const createOrganizationRoleMutation = gql(/* GraphQL */ `
  mutation createOrganizationRoleMutation(
    $tenantId: ID!
    $name: String!
    $description: String
    $color: RoleColor
    $permissionIds: [ID]!
  ) {
    createOrganizationRole(
      tenantId: $tenantId
      name: $name
      description: $description
      color: $color
      permissionIds: $permissionIds
    ) {
      role {
        id
        name
        description
        color
        memberCount
        permissions {
          id
          code
          name
          category
        }
      }
      ok
    }
  }
`);

/**
 * Mutation to update an organization role
 */
export const updateOrganizationRoleMutation = gql(/* GraphQL */ `
  mutation updateOrganizationRoleMutation(
    $id: ID!
    $tenantId: ID!
    $name: String
    $description: String
    $color: RoleColor
    $permissionIds: [ID]
  ) {
    updateOrganizationRole(
      id: $id
      tenantId: $tenantId
      name: $name
      description: $description
      color: $color
      permissionIds: $permissionIds
    ) {
      role {
        id
        name
        description
        color
        memberCount
        permissions {
          id
          code
          name
          category
        }
      }
      ok
    }
  }
`);

/**
 * Mutation to delete an organization role
 */
export const deleteOrganizationRoleMutation = gql(/* GraphQL */ `
  mutation deleteOrganizationRoleMutation($id: ID!, $tenantId: ID!, $replacementRoleId: ID) {
    deleteOrganizationRole(id: $id, tenantId: $tenantId, replacementRoleId: $replacementRoleId) {
      ok
      affectedMemberCount
    }
  }
`);

/**
 * Mutation to assign roles to a member
 */
export const assignRolesToMemberMutation = gql(/* GraphQL */ `
  mutation assignRolesToMemberMutation($membershipId: ID!, $tenantId: ID!, $roleIds: [ID]!) {
    assignRolesToMember(membershipId: $membershipId, tenantId: $tenantId, roleIds: $roleIds) {
      membership {
        id
        organizationRoles {
          id
          name
          color
        }
      }
      ok
    }
  }
`);

/**
 * Mutation to remove a role from a member
 */
export const removeRoleFromMemberMutation = gql(/* GraphQL */ `
  mutation removeRoleFromMemberMutation($membershipId: ID!, $tenantId: ID!, $roleId: ID!) {
    removeRoleFromMember(membershipId: $membershipId, tenantId: $tenantId, roleId: $roleId) {
      membership {
        id
        organizationRoles {
          id
          name
          color
        }
      }
      ok
    }
  }
`);

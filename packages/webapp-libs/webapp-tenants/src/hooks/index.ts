export * from './useGenerateTenantPath';
export * from './useTenants';
export * from './useTenantRoles';
export * from './useTenantSSO';
export * from './useTenantSCIM';
export * from './useTenantPasskeys';
export * from './useTenantAuditLogs';
export * from './useSSODiscover';
export * from './useTenantRoleAccessCheck';
export * from './useCurrentTenantRole';
export * from './useCurrentTenantMembership';
export * from './usePermissionCheck';

// Re-export PermissionGate from components for convenience
export { PermissionGate } from '../components/permissionGate';
export type { PermissionGateProps } from '../components/permissionGate';

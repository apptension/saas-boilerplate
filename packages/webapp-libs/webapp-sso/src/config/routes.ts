export const RoutesConfig = {
  ssoSettings: '/settings/sso',
  ssoConnections: '/settings/sso/connections',
  ssoConnectionNew: '/settings/sso/connections/new',
  ssoConnectionEdit: '/settings/sso/connections/:connectionId',
  scimTokens: '/settings/sso/scim',
  passkeys: '/settings/security/passkeys',
  sessions: '/settings/security/sessions',
  devices: '/settings/security/devices',
  auditLogs: '/settings/sso/audit',
  // Auth callback routes
  ssoCallback: '/auth/sso/callback',
  ssoError: '/auth/sso/error',
};


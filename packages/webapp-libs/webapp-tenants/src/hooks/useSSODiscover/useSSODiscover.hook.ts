import { useLazyQuery } from '@apollo/client/react';
import { gql } from '@sb/webapp-api-client/graphql';

const SSO_DISCOVER_QUERY = gql(`
  query SSODiscover($email: String!) {
    ssoDiscover(email: $email) {
      ssoAvailable
      requireSso
      connections {
        id
        name
        type
        tenantId
        tenantName
        loginUrl
      }
    }
  }
`);

export function useSSODiscover() {
  const [discover, { data, loading }] = useLazyQuery(SSO_DISCOVER_QUERY);

  const conns = data?.ssoDiscover?.connections;
  const result = data?.ssoDiscover
    ? {
        sso_available: data.ssoDiscover.ssoAvailable ?? false,
        require_sso: data.ssoDiscover.requireSso ?? false,
        connections: (conns ?? [])
          .filter((c): c is NonNullable<typeof c> => c != null)
          .map((c) => ({
            id: c.id ?? '',
            name: c.name ?? '',
            type: ((c.type ?? '').toLowerCase() === 'oidc' ? 'oidc' : 'saml') as 'saml' | 'oidc',
            tenant_id: c.tenantId ?? '',
            tenant_name: c.tenantName ?? '',
            login_url: c.loginUrl ?? '',
          })),
      }
    : null;

  return {
    discover: (email: string) => discover({ variables: { email } }),
    result,
    loading,
  };
}

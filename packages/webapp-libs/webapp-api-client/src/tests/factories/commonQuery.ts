import { CurrentUserType, TenantConnection, TenantType } from '../../graphql';
import { commonQueryCurrentUserQuery } from '../../providers/commonQuery';
import { composeMockedQueryResult, mapRelayEdges } from '../../tests/utils';

export const fillCommonQueryWithUser = (
  currentUser: CurrentUserType | null = null,
  tenants: Partial<TenantType>[] = []
) => {
  const allTenants: Partial<TenantConnection> = {
    edges: mapRelayEdges(tenants, 'TenantEdge').edges,
  };

  return composeMockedQueryResult(commonQueryCurrentUserQuery, {
    data: {
      currentUser: currentUser
        ? {
            __typename: 'CurrentUserType',
            ...currentUser,
          }
        : null,
      ...(tenants !== null ? { allTenants } : {}),
    },
  });
};

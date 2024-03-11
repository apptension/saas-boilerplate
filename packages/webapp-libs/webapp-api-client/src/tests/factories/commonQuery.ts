import { CurrentUserType, TenantConnection } from '../../graphql';
import { commonQueryCurrentUserQuery } from '../../providers/commonQuery';
import { composeMockedQueryResult, mapRelayEdges } from '../../tests/utils';

const defaultTenants = {
  edges: mapRelayEdges([], 'TenantEdge').edges,
};

export const fillCommonQueryWithUser = (
  currentUser: CurrentUserType | null = null,
  tenants: Partial<TenantConnection> = defaultTenants
) => {
  return composeMockedQueryResult(commonQueryCurrentUserQuery, {
    data: {
      currentUser: currentUser
        ? {
            __typename: 'CurrentUserType',
            ...currentUser,
          }
        : null,
      ...(tenants !== null ? { allTenants: tenants } : {}),
    },
  });
};

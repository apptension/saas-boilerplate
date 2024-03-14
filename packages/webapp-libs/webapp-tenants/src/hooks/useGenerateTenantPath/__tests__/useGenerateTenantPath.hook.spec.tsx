import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { RoutesConfig } from '@sb/webapp-core/config/routes';

import { useGenerateTenantPath } from '../';
import { TenantRole } from '../../../modules/auth/tenantRole.types';
import { tenantFactory } from '../../../tests/factories/tenant';
import { renderHook } from '../../../tests/utils/rendering';

const render = () => {
  const apolloMocks = [
    fillCommonQueryWithUser(currentUserFactory(), [tenantFactory({ membership: { role: TenantRole.MEMBER } })]),
  ];
  return renderHook(() => useGenerateTenantPath(), {
    apolloMocks,
  });
};

describe('useGenerateTenantPath: Hook', () => {
  it('should compose the right url to the tenant home page', async () => {
    const { result, waitForApolloMocks } = render();
    await waitForApolloMocks();
    expect(result.current(RoutesConfig.home, { tenantId: 'example-tenant' })).toEqual('/en/example-tenant');
  });
});

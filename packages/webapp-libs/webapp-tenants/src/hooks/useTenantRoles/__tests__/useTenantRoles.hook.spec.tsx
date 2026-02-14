import { TenantUserRole } from '@sb/webapp-api-client';
import { fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';

import { tenantFactory } from '../../../tests/factories/tenant';
import { renderHook } from '../../../tests/utils/rendering';
import { useTenantRoles } from '../useTenantRoles.hook';

describe('useTenantRoles: Hook', () => {
  const render = () => {
    const tenant = tenantFactory({ membership: { role: TenantUserRole.OWNER } });
    const apolloMocks = [fillCommonQueryWithUser({ tenants: [tenant] })];
    return renderHook(() => useTenantRoles(), { apolloMocks });
  };

  it('should return roleTranslations for all tenant roles', async () => {
    const { result, waitForApolloMocks } = render();
    await waitForApolloMocks();

    expect(result.current.roleTranslations[TenantUserRole.OWNER]).toBe('Owner');
    expect(result.current.roleTranslations[TenantUserRole.ADMIN]).toBe('Admin');
    expect(result.current.roleTranslations[TenantUserRole.MEMBER]).toBe('Member');
  });

  it('should return getRoleTranslation function that maps role to translation', async () => {
    const { result, waitForApolloMocks } = render();
    await waitForApolloMocks();

    expect(result.current.getRoleTranslation(TenantUserRole.OWNER)).toBe('Owner');
    expect(result.current.getRoleTranslation(TenantUserRole.ADMIN)).toBe('Admin');
    expect(result.current.getRoleTranslation(TenantUserRole.MEMBER)).toBe('Member');
  });

  it('should return consistent translations for same role', async () => {
    const { result, waitForApolloMocks } = render();
    await waitForApolloMocks();

    const first = result.current.getRoleTranslation(TenantUserRole.OWNER);
    const second = result.current.roleTranslations[TenantUserRole.OWNER];
    expect(first).toBe(second);
  });
});

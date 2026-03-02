import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { act, waitFor } from '@testing-library/react';

import { tenantFactory } from '../../../tests/factories/tenant';
import { createMockRouterProps, renderHook } from '../../../tests/utils/rendering';
import { usePermissionCheck } from '../usePermissionCheck.hook';
import { currentUserPermissionsQuery } from '../../../routes/tenantSettings/tenantRoles/tenantRoles.graphql';

const tenantId = 'tenant-1';

describe('usePermissionCheck: Hook', () => {
  it('should return hasPermission true when user has the permission', async () => {
    const permissionsMock = composeMockedQueryResult(currentUserPermissionsQuery, {
      variables: { tenantId },
      data: { currentUserPermissions: ['org.settings.view', 'org.settings.edit'] },
    });

    const apolloMocks = [
      fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [tenantFactory({ id: tenantId })],
        })
      ),
      permissionsMock,
    ];
    const routerProps = createMockRouterProps('/tenant/settings/general', { tenantId });

    const { result } = renderHook(() => usePermissionCheck('org.settings.view'), {
      apolloMocks,
      routerProps,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasPermission).toBe(true);
    expect(result.current.hasAnyPermission).toBe(true);
  });

  it('should return hasPermission false when user lacks the permission', async () => {
    const permissionsMock = composeMockedQueryResult(currentUserPermissionsQuery, {
      variables: { tenantId },
      data: { currentUserPermissions: ['members.view'] },
    });

    const apolloMocks = [
      fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [tenantFactory({ id: tenantId })],
        })
      ),
      permissionsMock,
    ];
    const routerProps = createMockRouterProps('/tenant/settings/general', { tenantId });

    const { result } = renderHook(() => usePermissionCheck('org.settings.edit'), {
      apolloMocks,
      routerProps,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasPermission).toBe(false);
  });

  it('should return hasPermission true when user has wildcard permission', async () => {
    const permissionsMock = composeMockedQueryResult(currentUserPermissionsQuery, {
      variables: { tenantId },
      data: { currentUserPermissions: ['org.*'] },
    });

    const apolloMocks = [
      fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [tenantFactory({ id: tenantId })],
        })
      ),
      permissionsMock,
    ];
    const routerProps = createMockRouterProps('/tenant/settings/general', { tenantId });

    const { result } = renderHook(() => usePermissionCheck('org.settings.edit'), {
      apolloMocks,
      routerProps,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasPermission).toBe(true);
  });
});

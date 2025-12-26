import { TenantUserRole } from '@sb/webapp-api-client';

import { useTenantRoleAccessCheck } from '../../../hooks';
import {
  SSOConnectionCard,
  DirectorySyncCard,
  AuditLogCard,
} from './components';

export const TenantSecuritySettings = () => {
  const { isAllowed: canManageSSO } = useTenantRoleAccessCheck([
    TenantUserRole.OWNER,
    TenantUserRole.ADMIN,
  ]);

  return (
    <div className="space-y-6">
      <SSOConnectionCard canManageSSO={canManageSSO} />
      <DirectorySyncCard canManageSSO={canManageSSO} />
      {canManageSSO && <AuditLogCard />}
    </div>
  );
};

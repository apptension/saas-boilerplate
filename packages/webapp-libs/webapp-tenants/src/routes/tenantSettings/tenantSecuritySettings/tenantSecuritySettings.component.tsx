import { usePermissionCheck } from '../../../hooks';
import { SSOConnectionCard, DirectorySyncCard, PasskeysCard, AuditLogCard } from './components';

export const TenantSecuritySettings = () => {
  // Permission checks
  const { hasPermission: canManageSSO } = usePermissionCheck('security.sso.manage');
  const { hasPermission: canManagePasskeys } = usePermissionCheck('security.passkeys.manage');
  const { hasPermission: canViewLogs } = usePermissionCheck('security.logs.view');

  return (
    <div className="space-y-6">
      <SSOConnectionCard canManageSSO={canManageSSO} />
      <DirectorySyncCard canManageSSO={canManageSSO} />
      <PasskeysCard canManagePasskeys={canManagePasskeys} />
      {canViewLogs && <AuditLogCard />}
    </div>
  );
};

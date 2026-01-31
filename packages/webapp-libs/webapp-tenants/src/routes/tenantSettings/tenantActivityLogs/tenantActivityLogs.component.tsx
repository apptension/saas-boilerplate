import { Navigate } from 'react-router-dom';

import { RoutesConfig } from '../../../config/routes';
import { useGenerateTenantPath, usePermissionCheck } from '../../../hooks';
import { ActionLogCard, LoggingSettingsCard } from './components';

export const TenantActivityLogs = () => {
  const generateTenantPath = useGenerateTenantPath();

  // Permission check for viewing security logs
  const { hasPermission: canViewLogs, loading } = usePermissionCheck('security.logs.view');

  // Redirect if user doesn't have permission to view logs
  if (!loading && !canViewLogs) {
    return <Navigate to={generateTenantPath(RoutesConfig.tenant.settings.general)} replace />;
  }

  return (
    <div className="space-y-6">
      <LoggingSettingsCard />
      <ActionLogCard />
    </div>
  );
};

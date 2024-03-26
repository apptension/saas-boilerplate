import { TenantUserRole } from '@sb/webapp-api-client';
import { useIntl } from 'react-intl';

export const useTenantRoles = () => {
  const intl = useIntl();

  const roleTranslations = {
    [TenantUserRole.OWNER]: intl.formatMessage({ defaultMessage: 'Owner', id: 'Tenant roles / Owner' }),
    [TenantUserRole.ADMIN]: intl.formatMessage({ defaultMessage: 'Admin', id: 'Tenant roles / Admin' }),
    [TenantUserRole.MEMBER]: intl.formatMessage({ defaultMessage: 'Member', id: 'Tenant roles / Member' }),
  };

  const getRoleTranslation = (role: TenantUserRole) => roleTranslations[role];

  return {
    roleTranslations,
    getRoleTranslation,
  };
};

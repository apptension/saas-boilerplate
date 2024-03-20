import { useIntl } from 'react-intl';

import { TenantRole } from '../../modules/auth/tenantRole.types';

export const useTenantRoles = () => {
  const intl = useIntl();

  const roleTranslations = {
    [TenantRole.OWNER]: intl.formatMessage({ defaultMessage: 'Owner', id: 'Tenant roles / Owner' }),
    [TenantRole.ADMIN]: intl.formatMessage({ defaultMessage: 'Admin', id: 'Tenant roles / Admin' }),
    [TenantRole.MEMBER]: intl.formatMessage({ defaultMessage: 'Member', id: 'Tenant roles / Member' }),
  };

  const getRoleTranslation = (role: TenantRole) => roleTranslations[role];

  return {
    roleTranslations,
    getRoleTranslation,
  };
};

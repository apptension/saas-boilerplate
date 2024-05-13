import { TenantUserRole } from '@sb/webapp-api-client';
import { useIntl } from 'react-intl';

/**
 * Hook that provides translations for tenant roles.
 *
 * The hook returns an object with two properties:
 * - `roleTranslations`: an object mapping each role to its translated string.
 * - `getRoleTranslation`: a function that takes a role and returns its translated string.
 *
 * @returns {Object} An object containing role translations and a function to get role translation.
 *
 */
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

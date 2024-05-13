import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { Notification, NotificationType } from '@sb/webapp-notifications';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

import { useTenants } from '../../hooks';

export type TenantInvitationCreatedProps = NotificationType<{
  id: string;
  tenant_name: string;
}>;

export const TenantInvitationCreated = ({
  data: { id, tenant_name },
  issuer,
  ...restProps
}: TenantInvitationCreatedProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const navigate = useNavigate();
  const { reload: reloadCommonQuery } = useCommonQuery();
  const [shouldNavigateWithSideEffect, setSideEffectNavigation] = useState(false);

  const tenants = useTenants();

  const handleInvitationClick = useCallback(
    (initialClick: boolean = false) => {
      const tenant = tenants.find((tenant) => tenant?.membership?.id === id);

      if (!tenant) {
        if (initialClick) reloadCommonQuery().then(() => setSideEffectNavigation(true));
        return;
      }

      const token = tenant.membership.invitationToken;
      if (!token) return;

      navigate(generateLocalePath(RoutesConfig.tenantInvitation, { token }));
    },
    [generateLocalePath, id, navigate, reloadCommonQuery, tenants]
  );

  useEffect(() => {
    if (shouldNavigateWithSideEffect) {
      handleInvitationClick(true);
      setSideEffectNavigation(false);
    }
  }, [handleInvitationClick, shouldNavigateWithSideEffect]);

  return (
    <Notification
      {...restProps}
      onClick={() => handleInvitationClick(true)}
      avatar={issuer?.avatar}
      title={issuer?.email}
      content={
        <FormattedMessage
          defaultMessage={'You have been invited to "{tenant_name}"'}
          id="Notifications / Tenant / Invitation Created"
          values={{ tenant_name }}
        />
      }
    />
  );
};

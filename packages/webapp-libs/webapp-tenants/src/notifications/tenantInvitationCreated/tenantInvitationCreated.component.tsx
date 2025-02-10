import { getFragmentData } from '@sb/webapp-api-client';
import { commonQueryMembershipFragment } from '@sb/webapp-api-client/providers';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { Notification, NotificationType } from '@sb/webapp-notifications';
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

  const tenants = useTenants();

  const handleInvitationClick = () => {
    const tenant = tenants.find(
      (tenant) => getFragmentData(commonQueryMembershipFragment, tenant?.membership)?.id === id
    );

    const token = getFragmentData(commonQueryMembershipFragment, tenant?.membership)?.invitationToken;
    if (!token) return;

    navigate(generateLocalePath(RoutesConfig.tenantInvitation, { token }));
  };

  return (
    <Notification
      {...restProps}
      onClick={handleInvitationClick}
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

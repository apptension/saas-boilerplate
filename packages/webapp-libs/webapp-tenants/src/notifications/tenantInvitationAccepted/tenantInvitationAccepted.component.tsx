import { Notification, NotificationType } from '@sb/webapp-notifications';
import { FormattedMessage } from 'react-intl';

export type TenantInvitationAcceptedProps = NotificationType<{
  id: string;
  name: string;
  tenant_name: string;
}>;

export const TenantInvitationAccepted = ({
  data: { name, tenant_name },
  issuer,
  ...restProps
}: TenantInvitationAcceptedProps) => {
  return (
    <Notification
      {...restProps}
      avatar={issuer?.avatar}
      title={issuer?.email}
      content={
        <FormattedMessage
          defaultMessage={'Your invitation to "{tenant_name}" has been accepted by "{name}"'}
          id="Notifications / Tenant / Invitation Accepted"
          values={{ tenant_name, name }}
        />
      }
    />
  );
};

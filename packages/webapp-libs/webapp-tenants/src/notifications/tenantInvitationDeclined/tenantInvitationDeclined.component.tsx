import { Notification, NotificationType } from '@sb/webapp-notifications';
import { FormattedMessage } from 'react-intl';

export type TenantInvitationDeclinedProps = NotificationType<{
  id: string;
  name: string;
  tenant_name: string;
}>;

export const TenantInvitationDeclined = ({
  data: { name, tenant_name },
  issuer,
  ...restProps
}: TenantInvitationDeclinedProps) => {
  return (
    <Notification
      {...restProps}
      avatar={issuer?.avatar}
      title={issuer?.email}
      content={
        <FormattedMessage
          defaultMessage={'Your invitation to "{tenant_name}" has been declined by "{name}"'}
          id="Notifications / Tenant / Invitation Declined"
          values={{ tenant_name, name }}
        />
      }
    />
  );
};

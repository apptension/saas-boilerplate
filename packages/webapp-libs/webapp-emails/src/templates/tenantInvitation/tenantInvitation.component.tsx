import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateAbsoluteLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage } from 'react-intl';

import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';

export type TenantInvitationProps = EmailComponentProps & {
  token: string;
  tenantMembershipId: string;
};

export const Template = ({ token, tenantMembershipId }: TenantInvitationProps) => {
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(RoutesConfig.tenantInvitation, { token });

  return (
    <Layout
      title={
        <FormattedMessage
          defaultMessage="You have a new organization invitation"
          id="Email / TenantInvitation / Title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="Click button below to accept or decline new invitation."
          id="Email / TenantInvitation / Text"
        />
      }
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="View invitation" id="Email / TenantInvitation / View invitation" />
      </Button>
    </Layout>
  );
};

export const Subject = () => (
  <FormattedMessage defaultMessage="You have a new organization invitation" id="Email / TenantInvitation / Subject" />
);

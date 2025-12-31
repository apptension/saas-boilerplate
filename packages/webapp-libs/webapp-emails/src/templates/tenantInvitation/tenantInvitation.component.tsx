import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateAbsoluteLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import { Button, Layout } from '../../base';
import { EmailComponentProps } from '../../types';

export type TenantInvitationProps = EmailComponentProps & {
  token: string;
  tenantMembershipId: string;
};

export const Template = ({ token }: TenantInvitationProps) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(RoutesConfig.tenantInvitation, { token });

  const preheaderText = intl.formatMessage({
    defaultMessage: "You've been invited to join an organization",
    id: 'Email / TenantInvitation / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
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
      footer={{
        companyName: 'SaaS Boilerplate',
      }}
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

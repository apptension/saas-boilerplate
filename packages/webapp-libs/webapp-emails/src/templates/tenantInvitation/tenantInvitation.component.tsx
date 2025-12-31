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
    defaultMessage: 'Join the team and start collaborating today',
    id: 'Email / TenantInvitation / Preheader',
  });

  return (
    <Layout
      preheader={preheaderText}
      title={
        <FormattedMessage
          defaultMessage="You're invited to join a team"
          id="Email / TenantInvitation / Title"
        />
      }
      text={
        <FormattedMessage
          defaultMessage="Great news! You've been invited to join an organization. Click below to view the invitation details and decide whether to accept or decline."
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
  <FormattedMessage defaultMessage="You're invited to join a team" id="Email / TenantInvitation / Subject" />
);

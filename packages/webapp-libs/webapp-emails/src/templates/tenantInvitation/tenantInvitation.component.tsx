import { useGenerateAbsoluteLocalePath } from '@sb/webapp-core/hooks';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { FormattedMessage } from 'react-intl';

import { EmailComponentProps } from '../../types';
import { Button, Layout } from '../../base';


export type TenantInvitationProps = EmailComponentProps & {
  token: string
  tenantMembershipId: string
};

export const Template = ({token, tenantMembershipId}: TenantInvitationProps) => {
  const generateLocalePath = useGenerateAbsoluteLocalePath();
  const url = generateLocalePath(RoutesConfig.home);

  return (
    <Layout
      title={<FormattedMessage defaultMessage="You have a new tenant invitation" id="Email / TenantInvitation / Title" />}
      text={
        <FormattedMessage
          defaultMessage="Click button below to accept or decline new invitation.<br />Token: {token}<br />MembershipId: {tenantMembershipId}"
          id="Email / TenantInvitation / Text"
          values={{ token: token, tenantMembershipId: tenantMembershipId }}
        />
      }
    >
      <Button linkTo={url}>
        <FormattedMessage defaultMessage="Button" id="Email / TenantInvitation / Link label" />
      </Button>
    </Layout>
  );
};

export const Subject = () => <FormattedMessage defaultMessage="You have a new tenant invitation" id="Email / TenantInvitation / Subject" />

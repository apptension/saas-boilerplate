import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { TabsContent } from '@sb/webapp-core/components/tabs';
import { FormattedMessage } from 'react-intl';

import { TenantMembersList } from '../../../components/tenantMembersList';
import { RoutesConfig } from '../../../config/routes';
import { useGenerateTenantPath } from '../../../hooks';
import { InvitationForm } from './invitationForm';

export const TenantMembers = () => {
  const generateTenantPath = useGenerateTenantPath();

  return (
    <TabsContent value={generateTenantPath(RoutesConfig.tenant.settings.members)}>
      <div className="space-y-6 pt-4">
        <PageHeadline
          header={<FormattedMessage defaultMessage="Members" id="Tenant Members / Header" />}
          subheader={
            <FormattedMessage defaultMessage="View and manage organization members" id="Tenant Members / Subheader" />
          }
        />
        <InvitationForm />
        <TenantMembersList />
      </div>
    </TabsContent>
  );
};

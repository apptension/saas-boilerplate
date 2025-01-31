import { TenantType } from '@sb/webapp-api-client/constants';
import { Button } from '@sb/webapp-core/components/buttons';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { Alert } from '@sb/webapp-core/components/ui/alert';
import { TabsContent } from '@sb/webapp-core/components/ui/tabs';
import { RoutesConfig as RootRoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { Paragraph } from '@sb/webapp-core/theme/typography';
import { Plus } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { TenantMembersList } from '../../../components/tenantMembersList';
import { RoutesConfig } from '../../../config/routes';
import { useGenerateTenantPath } from '../../../hooks';
import { useCurrentTenant } from '../../../providers';
import { InvitationForm } from './invitationForm';

export const TenantMembers = () => {
  const generateTenantPath = useGenerateTenantPath();
  const generateLocalePath = useGenerateLocalePath();
  const navigate = useNavigate();
  const isPersonal = useCurrentTenant().data?.type === TenantType.PERSONAL;

  const handleNewTenantClick = () => {
    navigate(generateLocalePath(RootRoutesConfig.addTenant));
  };

  return (
    <TabsContent value={generateTenantPath(RoutesConfig.tenant.settings.members)}>
      <div className="space-y-6 pt-4">
        <PageHeadline
          header={<FormattedMessage defaultMessage="Members" id="Tenant Members / Header" />}
          subheader={
            <FormattedMessage defaultMessage="View and manage organization members" id="Tenant Members / Subheader" />
          }
        />
        {isPersonal ? (
          <Alert className="py-8" data-testid="tenant-members-alert">
            <Paragraph className="pb-4">
              <FormattedMessage
                defaultMessage="If you wish to invite people, you need to create an organization."
                id="Tenant Members / Alert"
              />
            </Paragraph>
            <Button data-testid="tenant-members-create-button" color="primary" size="sm" onClick={handleNewTenantClick}>
              <Plus className="mr-1" size="16" />{' '}
              <FormattedMessage defaultMessage="Create new organization" id="TenantSwitch / Create new organization" />
            </Button>
          </Alert>
        ) : (
          <div data-testid="tenant-members-list">
            <InvitationForm />
            <TenantMembersList />
          </div>
        )}
      </div>
    </TabsContent>
  );
};

import { TenantType } from '@sb/webapp-api-client/constants';
import { Button } from '@sb/webapp-core/components/buttons';
import { Alert } from '@sb/webapp-core/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { TabsContent } from '@sb/webapp-core/components/ui/tabs';
import { RoutesConfig as RootRoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { Paragraph } from '@sb/webapp-core/theme/typography';
import { Plus, Users } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { TenantMembersList } from '../../../components/tenantMembersList';
import { RoutesConfig } from '../../../config/routes';
import { useGenerateTenantPath, usePermissionCheck } from '../../../hooks';
import { useCurrentTenant } from '../../../providers';
import { InvitationForm } from './invitationForm';

export const TenantMembers = () => {
  const generateTenantPath = useGenerateTenantPath();
  const generateLocalePath = useGenerateLocalePath();
  const navigate = useNavigate();
  const isPersonal = useCurrentTenant().data?.type === TenantType.PERSONAL;

  // Permission checks
  const { hasPermission: canInvite } = usePermissionCheck('members.invite');

  const handleNewTenantClick = () => {
    navigate(generateLocalePath(RootRoutesConfig.addTenant));
  };

  return (
    <TabsContent value={generateTenantPath(RoutesConfig.tenant.settings.members)}>
      <div className="space-y-6">
        {isPersonal ? (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      <FormattedMessage defaultMessage="Members" id="Tenant Members / Header" />
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                      <FormattedMessage
                        defaultMessage="View and manage organization members"
                        id="Tenant Members / Subheader"
                      />
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="py-8" data-testid="tenant-members-alert">
                <Paragraph className="pb-4">
                  <FormattedMessage
                    defaultMessage="If you wish to invite people, you need to create an organization."
                    id="Tenant Members / Alert"
                  />
                </Paragraph>
                <Button
                  data-testid="tenant-members-create-button"
                  color="primary"
                  size="sm"
                  onClick={handleNewTenantClick}
                >
                  <Plus className="mr-1" size="16" />{' '}
                  <FormattedMessage
                    defaultMessage="Create new organization"
                    id="TenantSwitch / Create new organization"
                  />
                </Button>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <div data-testid="tenant-members-list" className="space-y-6">
            {/* Show invitation form only if user has members.invite permission */}
            {canInvite && <InvitationForm />}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        <FormattedMessage defaultMessage="Members" id="Tenant Members / Header" />
                      </CardTitle>
                      <CardDescription className="mt-0.5">
                        <FormattedMessage
                          defaultMessage="View and manage organization members"
                          id="Tenant Members / Subheader"
                        />
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TenantMembersList />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TabsContent>
  );
};

import { useMutation } from '@apollo/client/react';
import { TenantType } from '@sb/webapp-api-client/constants';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sb/webapp-core/components/ui/card';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast';
import { Settings } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { TenantDangerZone } from '../../../components/tenantDangerZone';
import { TenantForm } from '../../../components/tenantForm';
import { TenantFormFields } from '../../../components/tenantForm/tenantForm.component';
import { usePermissionCheck } from '../../../hooks';
import { useCurrentTenant } from '../../../providers';
import { updateTenantMutation } from './tenantGeneralSettings.graphql';

export const TenantGeneralSettings = () => {
  const { data: currentTenant } = useCurrentTenant();
  const { reload: reloadCommonQuery } = useCommonQuery();
  const { toast } = useToast();
  const intl = useIntl();

  // Permission checks
  const { hasPermission: canEditSettings } = usePermissionCheck('org.settings.edit');
  const { hasPermission: canDeleteOrg } = usePermissionCheck('org.delete');

  const successMessage = intl.formatMessage({
    id: 'Tenant form / UpdateTenant / Success message',
    defaultMessage: 'Organization updated successfully!',
  });

  const failMessage = intl.formatMessage({
    id: 'Membership Entry / UpdateTenant / Fail message',
    defaultMessage: 'Unable to change the organization data.',
  });

  const isOrganizationType = currentTenant?.type === TenantType.ORGANIZATION;

  const [commitUpdateMutation, { loading, error }] = useMutation(updateTenantMutation, {
    onCompleted: (data) => {
      const id = data.updateTenant?.tenant?.id;
      reloadCommonQuery();
      trackEvent('tenant', 'edit', id);
      toast({ description: successMessage, variant: 'success' });
    },
    onError: () => {
      toast({ description: failMessage, variant: 'destructive' });
    },
  });

  const onFormSubmit = (formData: TenantFormFields) => {
    if (!currentTenant) return;

    commitUpdateMutation({
      variables: {
        input: {
          id: currentTenant.id,
          name: formData.name,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* General Settings Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  <FormattedMessage defaultMessage="General" id="Tenant General Settings / Header" />
                </CardTitle>
                <CardDescription className="mt-0.5">
                  <FormattedMessage
                    defaultMessage="View and manage organization general settings"
                    id="Tenant General Settings / General subheader"
                  />
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TenantForm
            loading={loading}
            error={error}
            onSubmit={onFormSubmit}
            initialData={currentTenant?.name ? { name: currentTenant.name } : undefined}
            disabled={!canEditSettings}
          />
        </CardContent>
      </Card>

      {/* Danger Zone Card - only show if user can delete organization */}
      {isOrganizationType && canDeleteOrg && (
        <Card>
          <CardContent className="pt-6">
            <TenantDangerZone />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

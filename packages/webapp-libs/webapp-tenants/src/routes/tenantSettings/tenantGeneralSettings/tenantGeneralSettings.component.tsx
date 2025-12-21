import { useMutation } from '@apollo/client';
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
import { useCurrentTenant } from '../../../providers';
import { updateTenantMutation } from './tenantGeneralSettings.graphql';

export const TenantGeneralSettings = () => {
  const { data: currentTenant } = useCurrentTenant();
  const { reload: reloadCommonQuery } = useCommonQuery();
  const { toast } = useToast();
  const intl = useIntl();

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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <FormattedMessage defaultMessage="General" id="Tenant General Settings / Header" />
          </CardTitle>
          <CardDescription>
            <FormattedMessage
              defaultMessage="View and manage organization general settings"
              id="Tenant General Settings / General subheader"
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TenantForm
            loading={loading}
            error={error}
            onSubmit={onFormSubmit}
            initialData={currentTenant?.name ? { name: currentTenant.name } : undefined}
          />
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      {isOrganizationType && (
        <Card>
          <CardContent className="pt-6">
            <TenantDangerZone />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

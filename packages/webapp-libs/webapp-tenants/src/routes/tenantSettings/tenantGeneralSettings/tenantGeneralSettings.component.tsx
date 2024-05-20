import { useMutation } from '@apollo/client';
import { TenantType } from '@sb/webapp-api-client/constants';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast';
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
    defaultMessage: '🎉 Organization updated successfully!',
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
      toast({ description: successMessage });
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
    <div className="space-y-6 pt-4 mt-2">
      <PageHeadline
        header={<FormattedMessage defaultMessage="General" id="Tenant General Settings / Header" />}
        subheader={
          <FormattedMessage
            defaultMessage="View and manage organization general settings"
            id="Tenant General Settings / General subheader"
          />
        }
      />
      <TenantForm
        loading={loading}
        error={error}
        onSubmit={onFormSubmit}
        initialData={currentTenant?.name ? { name: currentTenant.name } : undefined}
      />

      {isOrganizationType && <TenantDangerZone />}
    </div>
  );
};

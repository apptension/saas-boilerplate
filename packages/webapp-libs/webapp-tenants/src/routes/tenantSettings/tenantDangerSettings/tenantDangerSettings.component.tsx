import { useMutation } from '@apollo/client';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast';
import { FormattedMessage, useIntl } from 'react-intl';

import { useNavigate } from 'react-router';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useCurrentTenant } from '../../../providers';
import { TenantRemoveForm } from '../../../components/tenantRemoveForm';
import { removeTenantMutation } from './tenantDangerSettings.graphql';


export const TenantDangerSettings = () => {
  const { data: currentTenant } = useCurrentTenant();
  const { reload: reloadCommonQuery } = useCommonQuery();
  const navigate = useNavigate()

  const generateLocalePath = useGenerateLocalePath();

  const { toast } = useToast();
  const intl = useIntl();

  const successMessage = intl.formatMessage({
    id: 'Tenant form / RemoveTenant / Success message',
    defaultMessage: '🎉 Tenant removed successfully!',
  });

  const failMessage = intl.formatMessage({
    id: 'Membership Entry / RemoveTenant / Fail message',
    defaultMessage: 'Unable to remove the tenant.',
  });



  const [commitRemoveMutation, { loading, error }] = useMutation(removeTenantMutation, {
    onCompleted: (data) => {
      console.log({ data })
      const id = data.deleteTenant?.deletedIds?.[0]?.toString()
      reloadCommonQuery();
      trackEvent('tenant', 'delete', id);
      toast({ description: successMessage });
      navigate(generateLocalePath(RoutesConfig.home), { replace: true })
    },
    onError: () => {
      toast({ description: failMessage, variant: 'destructive' });
    },
  });

  const onRemoveSubmit = () => {
    if (!currentTenant) return;

    commitRemoveMutation({
      variables: {
        input: {
          id: currentTenant.id
        }
      }
    })
  }

  return (
    <div className="space-y-6 pt-4 mt-2">
      <PageHeadline
        header={<FormattedMessage defaultMessage="Danger" id="Tenant Danger Settings / Header" />}
        subheader={
          <FormattedMessage
            defaultMessage="Manage organization danger settings"
            id="Tenant Danger Settings / Danger subheader"
          />
        }
      />

      <TenantRemoveForm onSubmit={onRemoveSubmit} loading={loading} error={error} />
    </div>
  );
};

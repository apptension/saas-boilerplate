import { useMutation } from '@apollo/client';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { Button } from '@sb/webapp-core/components/buttons';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { RoutesConfig } from '@sb/webapp-core/config/routes';

import { useCurrentTenant } from '../../providers';
import { deleteTenantMutation } from './tenantDangerZone.graphql';




export const TenantDangerZone = () => {
  const { data: currentTenant } = useCurrentTenant();
  const { reload: reloadCommonQuery } = useCommonQuery();
  const navigate = useNavigate()
  const { toast } = useToast();
  const intl = useIntl();

  const generateLocalePath = useGenerateLocalePath()

  const successDeleteMessage = intl.formatMessage({
    id: 'Tenant form / DeleteTenant / Success message',
    defaultMessage: '🎉 Tenant deleted successfully!',
  });

  const failDeleteMessage = intl.formatMessage({
    id: 'Membership Entry / DeleteTenant / Fail message',
    defaultMessage: 'Unable to delete the tenant.',
  });

  const [commitRemoveMutation, { loading, error }] = useMutation(deleteTenantMutation, {
    onCompleted: (data) => {
      const id = data.deleteTenant?.deletedIds?.[0]?.toString()
      reloadCommonQuery();
      trackEvent('tenant', 'delete', id);
      toast({ description: successDeleteMessage });
      navigate(generateLocalePath(RoutesConfig.home), { replace: true })
    },
    onError: () => {
      toast({ description: failDeleteMessage, variant: 'destructive' });
    },
  });

  const onDeleteSubmit = () => {
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
        header={<FormattedMessage defaultMessage="Danger" id="Tenant General Settings / Header / Danger" />}
        subheader={
          <FormattedMessage
            defaultMessage="View and manage organization danger settings"
            id="Tenant General Settings / Danger subheader"
          />
        }
      />
      <Button onClick={onDeleteSubmit} disabled={loading} variant="destructive" >
        <FormattedMessage defaultMessage="Remove organisation" id="Tenant Danger Settings / Remove tenant button" />
      </Button>



      {!!error && <p className="text-red-500">{error.graphQLErrors[0]?.message}</p>}
    </div>
  )


};

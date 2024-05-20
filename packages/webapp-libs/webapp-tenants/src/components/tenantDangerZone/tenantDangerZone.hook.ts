import { useMutation } from '@apollo/client';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { RoutesConfig } from '@sb/webapp-core/config/routes';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import { useCurrentTenant } from '../../providers';
import { deleteTenantMutation } from './tenantDangerZone.graphql';

export const useTenantDelete = () => {
  const { data: currentTenant } = useCurrentTenant();
  const { reload: reloadCommonQuery } = useCommonQuery();
  const navigate = useNavigate();
  const { toast } = useToast();
  const intl = useIntl();

  const generateLocalePath = useGenerateLocalePath();

  const successDeleteMessage = intl.formatMessage({
    id: 'Tenant form / DeleteTenant / Success message',
    defaultMessage: '🎉 Organization deleted successfully!',
  });

  const failDeleteMessage = intl.formatMessage({
    id: 'Membership Entry / DeleteTenant / Fail message',
    defaultMessage: 'Unable to delete the organization.',
  });

  const [commitRemoveMutation, { loading }] = useMutation(deleteTenantMutation, {
    onCompleted: (data) => {
      const id = data.deleteTenant?.deletedIds?.[0]?.toString();
      reloadCommonQuery();
      trackEvent('tenant', 'delete', id);
      toast({ description: successDeleteMessage });
      navigate(generateLocalePath(RoutesConfig.home), { replace: true });
    },
    onError: () => {
      toast({ description: failDeleteMessage, variant: 'destructive' });
    },
  });

  const deleteTenant = () => {
    if (!currentTenant) return;

    commitRemoveMutation({
      variables: {
        input: {
          id: currentTenant.id,
        },
      },
    });
  };

  return { deleteTenant, loading };
};

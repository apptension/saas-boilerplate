import { useMutation } from '@apollo/client';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../config/routes';
import { subscriptionChangeActiveMutation } from './editSubscription.graphql';

export const useEditSubscription = () => {
  const intl = useIntl();
  const { toast } = useToast();
  const navigate = useNavigate();
  const generateTenantPath = useGenerateTenantPath();
  const { data: currentTenant } = useCurrentTenant();

  const successMessage = intl.formatMessage({
    id: 'Change plan / Success message',
    defaultMessage: 'Plan changed successfully',
  });

  const failMessage = intl.formatMessage({
    id: 'Change plan / Fail message',
    defaultMessage: 'You need first to add a payment method. Go back and set it there',
  });

  const [commitChangeActiveSubscriptionMutation, { loading }] = useMutation(subscriptionChangeActiveMutation, {
    onError: () => {
      toast({ description: failMessage, variant: 'destructive' });
    },
    onCompleted: () => {
      trackEvent('subscription', 'change-plan');

      toast({ description: successMessage });
      navigate(generateTenantPath(RoutesConfig.subscriptions.index));
    },
  });

  const selectPlan = async (plan: string | null) => {
    if (!plan || !currentTenant) return;

    await commitChangeActiveSubscriptionMutation({
      variables: {
        input: {
          price: plan,
          tenantId: currentTenant.id,
        },
      },
    });
  };

  return { selectPlan, loading };
};

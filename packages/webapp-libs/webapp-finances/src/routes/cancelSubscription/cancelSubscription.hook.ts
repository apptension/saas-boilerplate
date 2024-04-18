import { useMutation } from '@apollo/client';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../config/routes';
import { subscriptionCancelMutation } from './cancelSubscription.graphql';

export const useCancelSubscription = () => {
  const intl = useIntl();
  const { toast } = useToast();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();
  const { data: currentTenant } = useCurrentTenant();

  const successMessage = intl.formatMessage({
    defaultMessage: 'You will be moved to free plan with the next billing period',
    id: 'Cancel subscription / Success message',
  });

  const [commitCancelActiveSubscriptionMutation] = useMutation(subscriptionCancelMutation, {
    onCompleted: () => {
      toast({ description: successMessage });

      trackEvent('subscription', 'cancel');

      navigate(generateLocalePath(RoutesConfig.subscriptions.index));
    },
    onError: (error) => reportError(error),
  });

  const handleCancel = () => {
    if (!currentTenant) return;

    commitCancelActiveSubscriptionMutation({
      variables: {
        input: {
          tenantId: currentTenant.id,
        },
      },
    });
  };

  return { handleCancel };
};

import { useMutation } from '@apollo/client';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useSnackbar } from '@sb/webapp-core/snackbar';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../config/routes';
import { subscriptionChangeActiveMutation } from './editSubscription.graphql';

export const useEditSubscription = () => {
  const intl = useIntl();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

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
      showMessage(failMessage);
    },
    onCompleted: () => {
      trackEvent('subscription', 'change-plan');

      showMessage(successMessage);
      navigate(generateLocalePath(RoutesConfig.subscriptions.index));
    },
  });

  const selectPlan = async (plan: string | null) => {
    if (!plan) return;

    await commitChangeActiveSubscriptionMutation({
      variables: {
        input: {
          price: plan,
        },
      },
    });
  };

  return { selectPlan, loading };
};

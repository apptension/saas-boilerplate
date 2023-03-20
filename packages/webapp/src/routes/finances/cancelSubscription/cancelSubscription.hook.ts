import { useMutation } from '@apollo/client';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useSnackbar } from '@sb/webapp-core/snackbar';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../../app/config/routes';
import { reportError } from '../../../shared/utils/reportError';
import { subscriptionCancelMutation } from './cancelSubscription.graphql';

export const useCancelSubscription = () => {
  const intl = useIntl();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  const successMessage = intl.formatMessage({
    defaultMessage: 'You will be moved to free plan with the next billing period',
    id: 'Cancel subscription / Success message',
  });

  const [commitCancelActiveSubscriptionMutation] = useMutation(subscriptionCancelMutation, {
    onCompleted: () => {
      showMessage(successMessage);
      navigate(generateLocalePath(RoutesConfig.subscriptions.index));
    },
    onError: (error) => reportError(error),
  });

  const handleCancel = () => {
    commitCancelActiveSubscriptionMutation({
      variables: {
        input: {},
      },
    });
  };

  return { handleCancel };
};

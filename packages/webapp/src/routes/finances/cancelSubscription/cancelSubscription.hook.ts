import { useMutation } from '@apollo/client';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../../app/config/routes';
import { useSnackbar } from '../../../modules/snackbar/snackbar.hooks';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { reportError } from '../../../shared/utils/reportError';
import { SUBSCRIPTION_CANCEL_MUTATION } from './cancelSubscription.graphql';

export const useCancelSubscription = () => {
  const intl = useIntl();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  const successMessage = intl.formatMessage({
    defaultMessage: 'You will be moved to free plan with the next billing period',
    id: 'Cancel subscription / Success message',
  });

  const [commitCancelActiveSubscriptionMutation] = useMutation(SUBSCRIPTION_CANCEL_MUTATION, {
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

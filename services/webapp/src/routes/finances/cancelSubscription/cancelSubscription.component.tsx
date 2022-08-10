import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { H2, Label } from '../../../theme/typography';
import { useActiveSubscriptionPlanDetails } from '../../../shared/hooks/finances/useSubscriptionPlanDetails';
import { selectActiveSubscriptionRenewalDate } from '../../../modules/subscription/subscription.selectors';
import { Button } from '../../../shared/components/forms/button';
import { useAsyncDispatch } from '../../../shared/utils/reduxSagaPromise';
import { subscriptionActions } from '../../../modules/subscription';
import { useSnackbar } from '../../../shared/components/snackbar';
import { Routes } from '../../../app/config/routes';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { FormattedDate } from '../../../shared/components/dateTime/formattedDate';
import { Container } from './cancelSubscription.styles';

export const CancelSubscription = () => {
  const dispatch = useAsyncDispatch();
  const intl = useIntl();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  const activeSubscriptionPlan = useActiveSubscriptionPlanDetails();
  const activeSubscriptionRenewalDate = useSelector(selectActiveSubscriptionRenewalDate);

  const successMessage = intl.formatMessage({
    defaultMessage: 'You will be moved to free plan with the next billing period',
    description: 'Cancel subscription / Success message',
  });

  const handleConfirm = async () => {
    try {
      await dispatch(subscriptionActions.cancelSubscription());
      showMessage(successMessage);
      navigate(generateLocalePath(Routes.subscriptions.index));
    } catch {}
  };

  return (
    <Container>
      <H2>
        <FormattedMessage defaultMessage="Current plan info" description="Cancel subscription / Current plan header" />
      </H2>
      <Label>
        <FormattedMessage
          defaultMessage="Active plan: {name} [{price} USD]"
          description="Cancel subscription / Active plan"
          values={{ name: activeSubscriptionPlan?.name, price: activeSubscriptionPlan?.price }}
        />
      </Label>
      <Label>
        <FormattedMessage
          defaultMessage="Next renewal / expiry: {date}"
          description="Cancel subscription / Next renewal"
          values={{ date: <FormattedDate value={activeSubscriptionRenewalDate} /> }}
        />
      </Label>

      <Button onClick={handleConfirm}>
        <FormattedMessage defaultMessage="Cancel subscription" description="Cancel subscription / Button label" />
      </Button>
    </Container>
  );
};

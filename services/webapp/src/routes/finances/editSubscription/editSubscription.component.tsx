import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useAsyncDispatch } from '../../../shared/utils/reduxSagaPromise';
import { subscriptionActions } from '../../../modules/subscription';
import { useSnackbar } from '../../../shared/components/snackbar';
import { RoutesConfig } from '../../../app/config/routes';
import { BackButton } from '../../../shared/components/backButton';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { SubscriptionPlans } from './subscriptionPlans';
import { Container, Header, Subheader } from './editSubscription.styles';

export const EditSubscription = () => {
  const intl = useIntl();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();
  const dispatch = useAsyncDispatch();

  const successMessage = intl.formatMessage({
    id: 'Change plan / Success message',
    defaultMessage: 'Plan changed successfully',
  });

  const failMessage = intl.formatMessage({
    id: 'Change plan / Fail message',
    defaultMessage: 'You need first to add a payment method. Go back and set it there',
  });

  const selectPlan = async (plan: string | null) => {
    if (!plan) {
      return;
    }
    const res = await dispatch(
      subscriptionActions.updateSubscriptionPlan({
        price: plan,
      })
    );

    if (!res.isError) {
      await showMessage(successMessage);
      navigate(generateLocalePath(RoutesConfig.subscriptions.index));
    } else {
      await showMessage(failMessage);
    }
  };

  return (
    <Container>
      <BackButton />
      <Header>
        <FormattedMessage defaultMessage="Plans" id="Change plan / Heading" />
      </Header>

      <Subheader>
        <FormattedMessage defaultMessage="Choose a plan" id="Change plan / Subheading" />
      </Subheader>

      <SubscriptionPlans onPlanSelection={selectPlan} />
    </Container>
  );
};

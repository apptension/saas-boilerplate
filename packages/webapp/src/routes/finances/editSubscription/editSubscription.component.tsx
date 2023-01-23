import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { RoutesConfig } from '../../../app/config/routes';
import { BackButton } from '../../../shared/components/backButton';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { usePromiseMutation } from '../../../shared/services/graphqlApi/usePromiseMutation';
import subscriptionChangeActiveSubscriptionMutationGraphql, {
  subscriptionChangeActiveSubscriptionMutation,
} from '../../../modules/subscription/__generated__/subscriptionChangeActiveSubscriptionMutation.graphql';
import { useSnackbar } from '../../../modules/snackbar/snackbar.hooks';
import { SubscriptionPlans } from './subscriptionPlans';
import { Container, Header, Subheader } from './editSubscription.styles';

export const EditSubscription = () => {
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

  const [commitChangeActiveSubscriptionMutation] = usePromiseMutation<subscriptionChangeActiveSubscriptionMutation>(
    subscriptionChangeActiveSubscriptionMutationGraphql
  );

  const selectPlan = async (plan: string | null) => {
    if (!plan) {
      return;
    }

    const { errors } = await commitChangeActiveSubscriptionMutation({
      variables: {
        input: {
          price: plan,
        },
      },
    });

    if (!errors) {
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

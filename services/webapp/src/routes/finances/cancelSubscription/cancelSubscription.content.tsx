import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { PreloadedQuery } from 'react-relay';

import { H3 } from '../../../theme/typography';
import { Button } from '../../../shared/components/forms/button';
import { RoutesConfig } from '../../../app/config/routes';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { FormattedDate } from '../../../shared/components/dateTime/formattedDate';
import subscriptionCancelActiveSubscriptionMutationGraphql, {
  subscriptionCancelActiveSubscriptionMutation,
} from '../../../modules/subscription/__generated__/subscriptionCancelActiveSubscriptionMutation.graphql';
import { usePromiseMutation } from '../../../shared/services/graphqlApi/usePromiseMutation';
import { subscriptionActivePlanDetailsQuery } from '../../../modules/subscription/__generated__/subscriptionActivePlanDetailsQuery.graphql';
import { BackButton } from '../../../shared/components/backButton';
import { useActiveSubscriptionDetailsData } from '../../../shared/hooks/finances/useActiveSubscriptionDetailsData/useActiveSubscriptionDetailsData';
import { useSnackbar } from '../../../modules/snackbar/snackbar.hooks';
import { Container, Row, RowValue } from './cancelSubscription.styles';

type CancelSubscriptionContentProps = {
  activeSubscriptionQueryRef: PreloadedQuery<subscriptionActivePlanDetailsQuery>;
};

export const CancelSubscriptionContent = ({ activeSubscriptionQueryRef }: CancelSubscriptionContentProps) => {
  const intl = useIntl();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  const { activeSubscriptionRenewalDate, activeSubscriptionPlan } =
    useActiveSubscriptionDetailsData(activeSubscriptionQueryRef);

  const successMessage = intl.formatMessage({
    defaultMessage: 'You will be moved to free plan with the next billing period',
    id: 'Cancel subscription / Success message',
  });

  const [commitCancelActiveSubscriptionMutation] = usePromiseMutation<subscriptionCancelActiveSubscriptionMutation>(
    subscriptionCancelActiveSubscriptionMutationGraphql
  );

  const handleConfirm = async () => {
    try {
      const { errors } = await commitCancelActiveSubscriptionMutation({
        variables: {
          input: {},
        },
      });

      if (!errors) {
        showMessage(successMessage);
        navigate(generateLocalePath(RoutesConfig.subscriptions.index));
      }
    } catch {}
  };

  return (
    <Container>
      <BackButton />
      <H3>
        <FormattedMessage defaultMessage="Current plan info" id="Cancel subscription / Current plan header" />
      </H3>
      <Row>
        <FormattedMessage defaultMessage="Active plan:" id="Cancel subscription / Active plan" />
        <RowValue>{activeSubscriptionPlan?.name}</RowValue>
      </Row>
      <Row>
        <FormattedMessage defaultMessage="Active plan price" id="Cancel subscription / Active plan price" />
        <RowValue>{activeSubscriptionPlan?.price} USD</RowValue>
      </Row>
      {activeSubscriptionRenewalDate && (
        <Row>
          <FormattedMessage defaultMessage="Next renewal / expiry:" id="Cancel subscription / Next renewal" />
          <RowValue>
            <FormattedDate value={activeSubscriptionRenewalDate} />
          </RowValue>
        </Row>
      )}

      <Row>
        <Button onClick={handleConfirm}>
          <FormattedMessage defaultMessage="Cancel subscription" id="Cancel subscription / Button label" />
        </Button>
      </Row>
    </Container>
  );
};

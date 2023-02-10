import { FormattedMessage } from 'react-intl';

import { BackButton } from '../../../shared/components/backButton';
import { FormattedDate } from '../../../shared/components/dateTime/formattedDate';
import { Button } from '../../../shared/components/forms/button';
import { useActiveSubscriptionDetailsData } from '../../../shared/hooks/finances/useActiveSubscriptionDetailsData/useActiveSubscriptionDetailsData';
import { H3 } from '../../../theme/typography';
import { useActiveSubscriptionDetails } from '../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { useCancelSubscription } from './cancelSubscription.hook';
import { Container, Row, RowValue } from './cancelSubscription.styles';

export const CancelSubscription = () => {
  const { activeSubscription } = useActiveSubscriptionDetails();

  const { activeSubscriptionRenewalDate, activeSubscriptionPlan } =
    useActiveSubscriptionDetailsData(activeSubscription);

  const { handleCancel } = useCancelSubscription();

  if (!activeSubscription) return null;

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
        <Button onClick={handleCancel}>
          <FormattedMessage defaultMessage="Cancel subscription" id="Cancel subscription / Button label" />
        </Button>
      </Row>
    </Container>
  );
};

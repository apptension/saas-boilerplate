import { BackButton, Button } from '@saas-boilerplate-app/webapp-core/components/buttons';
import { FormattedDate } from '@saas-boilerplate-app/webapp-core/components/dateTime';
import { typography } from '@saas-boilerplate-app/webapp-core/theme';
import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetails } from '../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { useActiveSubscriptionDetailsData } from '../hooks/useActiveSubscriptionDetailsData/useActiveSubscriptionDetailsData';
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
      <typography.H3>
        <FormattedMessage defaultMessage="Current plan info" id="Cancel subscription / Current plan header" />
      </typography.H3>
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

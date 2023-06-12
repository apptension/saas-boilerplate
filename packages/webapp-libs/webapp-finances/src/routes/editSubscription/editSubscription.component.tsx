import { BackButton } from '@sb/webapp-core/components/buttons';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { FormattedMessage } from 'react-intl';

import { useEditSubscription } from './editSubscription.hook';
import { Container, Header, Subheader } from './editSubscription.styles';
import { SubscriptionPlans } from './subscriptionPlans';

export const EditSubscription = () => {
  const { selectPlan, loading } = useEditSubscription();

  return (
    <Container>
      <BackButton />
      <Header>
        <FormattedMessage defaultMessage="Plans" id="Change plan / Heading" />
      </Header>

      <Subheader>
        <FormattedMessage defaultMessage="Choose a plan" id="Change plan / Subheading" />
      </Subheader>

      <SubscriptionPlans
        onPlanSelection={(id) => {
          selectPlan(id).catch(reportError);
        }}
        loading={loading}
      />
    </Container>
  );
};

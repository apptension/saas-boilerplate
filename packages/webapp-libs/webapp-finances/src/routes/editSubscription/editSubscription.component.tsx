import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { FormattedMessage } from 'react-intl';

import { useEditSubscription } from './editSubscription.hook';
import { SubscriptionPlans } from './subscriptionPlans';

export const EditSubscription = () => {
  const { selectPlan, loading } = useEditSubscription();

  return (
    <PageLayout className="lg:max-w-4xl">
      <PageHeadline
        hasBackButton
        header={<FormattedMessage defaultMessage="Plans" id="Change plan / Heading" />}
        subheader={<FormattedMessage defaultMessage="Choose a plan" id="Change plan / Subheading" />}
      />

      <SubscriptionPlans
        onPlanSelection={(id) => {
          selectPlan(id).catch(reportError);
        }}
        loading={loading}
      />
    </PageLayout>
  );
};

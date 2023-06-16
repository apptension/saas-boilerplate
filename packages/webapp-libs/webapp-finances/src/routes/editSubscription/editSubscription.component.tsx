import { BackButton } from '@sb/webapp-core/components/buttons';
import { Separator } from '@sb/webapp-core/components/separator';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { FormattedMessage } from 'react-intl';

import { useEditSubscription } from './editSubscription.hook';
import { SubscriptionPlans } from './subscriptionPlans';

export const EditSubscription = () => {
  const { selectPlan, loading } = useEditSubscription();

  return (
    <div className="px-8 space-y-8 flex-1 lg:max-w-2xl">
      <div>
        <BackButton className="float-right" />

        <h3 className="text-lg font-medium">
          <FormattedMessage defaultMessage="Plans" id="Change plan / Heading" />
        </h3>

        <p className="text-sm text-muted-foreground">
          <FormattedMessage defaultMessage="Choose a plan" id="Change plan / Subheading" />
        </p>
      </div>

      <Separator />

      <SubscriptionPlans
        onPlanSelection={(id) => {
          selectPlan(id).catch(reportError);
        }}
        loading={loading}
      />
    </div>
  );
};

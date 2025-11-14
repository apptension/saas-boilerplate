import { useQuery } from '@apollo/client';
import { Card, CardContent } from '@sb/webapp-core/components/ui/card';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { FormattedMessage } from 'react-intl';

import { useActiveSubscriptionDetails } from '../../../components/activeSubscriptionContext';
import { SubscriptionPlanItem } from '../subscriptionPlanItem';
import { subscriptionPlansAllQuery } from './subscriptionPlans.graphql';

export type SubscriptionPlansProps = {
  onPlanSelection: (id: string | null) => void;
  loading: boolean;
};

export const SubscriptionPlans = ({ onPlanSelection, loading }: SubscriptionPlansProps) => {
  const { activeSubscription } = useActiveSubscriptionDetails();

  const { data, loading: queryLoading } = useQuery(subscriptionPlansAllQuery);

  const plans = mapConnection((plan) => plan, data?.allSubscriptionPlans);
  const hasPlans = plans && plans.length > 0;

  if (queryLoading) {
    return null;
  }

  if (!hasPlans) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              <FormattedMessage
                defaultMessage="No subscription plans are currently available."
                id="Change plan / No plans available"
              />
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <SubscriptionPlanItem
          key={plan?.id}
          plan={plan}
          onSelect={onPlanSelection}
          activeSubscription={activeSubscription}
          loading={loading}
        />
      ))}
    </div>
  );
};

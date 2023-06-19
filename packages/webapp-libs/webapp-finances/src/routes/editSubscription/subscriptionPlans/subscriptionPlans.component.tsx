import { useQuery } from '@apollo/client';
import { mapConnection } from '@sb/webapp-core/utils/graphql';

import { useActiveSubscriptionDetails } from '../../../components/activeSubscriptionContext';
import { SubscriptionPlanItem } from '../subscriptionPlanItem';
import { subscriptionPlansAllQuery } from './subscriptionPlans.graphql';

export type SubscriptionPlansProps = {
  onPlanSelection: (id: string | null) => void;
  loading: boolean;
};

export const SubscriptionPlans = ({ onPlanSelection, loading }: SubscriptionPlansProps) => {
  const { activeSubscription } = useActiveSubscriptionDetails();

  const { data } = useQuery(subscriptionPlansAllQuery);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {mapConnection(
        (plan) => (
          <SubscriptionPlanItem
            key={plan?.id}
            plan={plan}
            onSelect={onPlanSelection}
            activeSubscription={activeSubscription}
            loading={loading}
          />
        ),
        data?.allSubscriptionPlans
      )}
    </div>
  );
};

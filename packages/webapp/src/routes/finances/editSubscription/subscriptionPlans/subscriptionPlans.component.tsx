import { useEffect, Suspense } from 'react';
import { useQueryLoader } from 'react-relay';
import subscriptionPlansAllQueryGraphql, {
  subscriptionPlansAllQuery,
} from '../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { useActiveSubscriptionDetails } from '../../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { SubscriptionPlansContent } from './subscriptionPlans.content';

export type SubscriptionPlansProps = {
  onPlanSelection: (id: string | null) => void;
};

export const SubscriptionPlans = ({ onPlanSelection }: SubscriptionPlansProps) => {
  const [plansQueryRef, loadPlansQuery] = useQueryLoader<subscriptionPlansAllQuery>(subscriptionPlansAllQueryGraphql);
  const { activeSubscription } = useActiveSubscriptionDetails();

  useEffect(() => {
    loadPlansQuery({});
  }, [loadPlansQuery]);

  if (!plansQueryRef) return null;

  return (
    <Suspense fallback={null}>
      <SubscriptionPlansContent
        queryRef={plansQueryRef}
        onPlanSelection={onPlanSelection}
        activeSubscription={activeSubscription}
      />
    </Suspense>
  );
};

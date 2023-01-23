import { Suspense } from 'react';
import { useActiveSubscriptionDetailsQueryRef } from '../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { CancelSubscriptionContent } from './cancelSubscription.content';

export const CancelSubscription = () => {
  const activeSubscriptionDetailsQueryRefContext = useActiveSubscriptionDetailsQueryRef();

  return activeSubscriptionDetailsQueryRefContext.ref ? (
    <Suspense fallback={null}>
      <CancelSubscriptionContent activeSubscriptionQueryRef={activeSubscriptionDetailsQueryRefContext.ref} />
    </Suspense>
  ) : null;
};

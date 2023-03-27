import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import { subscriptionPlanFactory } from '@sb/webapp-api-client/tests/factories';

import { useSubscriptionPlanDetails } from '..';
import { renderHook } from '../../../tests/utils/rendering';

const plan = subscriptionPlanFactory({
  unitAmount: 250,
  product: {
    name: SubscriptionPlanName.MONTHLY,
  },
});

describe('useSubscriptionPlanDetails: Hook', () => {
  const render = () => renderHook(() => useSubscriptionPlanDetails(plan));

  it('should return plan price in USD units', async () => {
    const { result, waitForApolloMocks } = render();
    await waitForApolloMocks();
    expect(result.current?.price).toBe(2.5);
  });

  it('should return plan display name', async () => {
    const { result, waitForApolloMocks } = render();
    await waitForApolloMocks();
    expect(result.current?.name).toBe('Monthly');
  });
});

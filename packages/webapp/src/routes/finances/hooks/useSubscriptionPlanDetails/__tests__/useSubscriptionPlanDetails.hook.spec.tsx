import { subscriptionPlanFactory } from '../../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../../shared/services/api/subscription/types';
import { renderHook } from '../../../../../tests/utils/rendering';
import { useSubscriptionPlanDetails } from '../useSubscriptionPlanDetails.hook';

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

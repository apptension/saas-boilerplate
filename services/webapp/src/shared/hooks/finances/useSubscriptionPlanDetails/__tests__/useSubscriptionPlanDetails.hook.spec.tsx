import { useSubscriptionPlanDetails } from '../useSubscriptionPlanDetails.hook';
import { subscriptionPlanFactory } from '../../../../../mocks/factories';
import { renderHook } from '../../../../../tests/utils/rendering';
import { SubscriptionPlanName } from '../../../../services/api/subscription/types';

const plan = subscriptionPlanFactory({
  unitAmount: 250,
  product: {
    name: SubscriptionPlanName.MONTHLY,
  },
});

describe('useSubscriptionPlanDetails: Hook', () => {
  const render = () => renderHook(() => useSubscriptionPlanDetails(plan));

  it('should return plan price in USD units', () => {
    const { result } = render();
    expect(result.current?.price).toBe(2.5);
  });

  it('should return plan display name', () => {
    const { result } = render();
    expect(result.current?.name).toBe('Monthly');
  });
});

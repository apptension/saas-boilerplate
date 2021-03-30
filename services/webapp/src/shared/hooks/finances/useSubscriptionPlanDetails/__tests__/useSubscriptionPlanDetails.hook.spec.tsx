import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { useSubscriptionPlanDetails } from '../useSubscriptionPlanDetails.hook';
import { subscriptionPlanFactory } from '../../../../../mocks/factories';
import { ProvidersWrapper } from '../../../../utils/testUtils';
import { SubscriptionPlanName } from '../../../../services/api/subscription/types';

const plan = subscriptionPlanFactory({
  unitAmount: 250,
  product: {
    name: SubscriptionPlanName.MONTHLY,
  },
});

const render = () =>
  renderHook(() => useSubscriptionPlanDetails(plan), {
    wrapper: ({ children }) => <ProvidersWrapper>{children}</ProvidersWrapper>,
  });

describe('useSubscriptionPlanDetails: Hook', () => {
  it('should return plan price in USD units', () => {
    const { result } = render();
    expect(result.current?.price).toBe(2.5);
  });

  it('should return plan display name', () => {
    const { result } = render();
    expect(result.current?.name).toBe('Monthly');
  });
});

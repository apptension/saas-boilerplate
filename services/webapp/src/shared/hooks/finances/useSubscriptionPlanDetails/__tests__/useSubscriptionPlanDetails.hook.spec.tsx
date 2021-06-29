import { renderHook } from '@testing-library/react-hooks';
import { useSubscriptionPlanDetails, useActiveSubscriptionPlanDetails } from '../useSubscriptionPlanDetails.hook';
import { subscriptionFactory, subscriptionPlanFactory } from '../../../../../mocks/factories';
import { ProvidersWrapper } from '../../../../utils/testUtils';
import { SubscriptionPlanName } from '../../../../services/api/subscription/types';
import { prepareState } from '../../../../../mocks/store';
import { subscriptionActions } from '../../../../../modules/subscription';

const plan = subscriptionPlanFactory({
  unitAmount: 250,
  product: {
    name: SubscriptionPlanName.MONTHLY,
  },
});

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('useSubscriptionPlanDetails: Hook', () => {
  const render = () =>
    renderHook(() => useSubscriptionPlanDetails(plan), {
      wrapper: ({ children }) => <ProvidersWrapper>{children}</ProvidersWrapper>,
    });

  it('should return plan price in USD units', () => {
    const { result } = render();
    expect(result.current?.price).toBe(2.5);
  });

  it('should return plan display name', () => {
    const { result } = render();
    expect(result.current?.name).toBe('Monthly');
  });
});

describe('useActiveSubscriptionPlanDetails: Hook', () => {
  const render = (props: { forceRefetch: boolean } = { forceRefetch: true }, store = prepareState((store) => store)) =>
    renderHook(() => useActiveSubscriptionPlanDetails(props), {
      wrapper: ({ children }) => <ProvidersWrapper context={{ store }}>{children}</ProvidersWrapper>,
    });

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  describe('{ forceRefetch: true }', () => {
    describe('subscription is not fetched yet', () => {
      it('should dispatch fetchActiveSubscription action', () => {
        render({ forceRefetch: true });
        expect(mockDispatch).toHaveBeenCalledWith(subscriptionActions.fetchActiveSubscription());
      });
    });

    describe('subscription is already fetched', () => {
      it('should dispatch fetchActiveSubscription action', () => {
        const store = prepareState((state) => {
          state.subscription.activeSubscription = subscriptionFactory();
        });
        render({ forceRefetch: true }, store);
        expect(mockDispatch).toHaveBeenCalledWith(subscriptionActions.fetchActiveSubscription());
      });
    });
  });

  describe('{ forceRefetch: false }', () => {
    describe('subscription is not fetched yet', () => {
      it('should dispatch fetchActiveSubscription action', () => {
        render({ forceRefetch: false });
        expect(mockDispatch).toHaveBeenCalledWith(subscriptionActions.fetchActiveSubscription());
      });
    });

    describe('subscription is already fetched', () => {
      it('should not dispatch fetchActiveSubscription action', () => {
        const store = prepareState((state) => {
          state.subscription.activeSubscription = subscriptionFactory();
        });
        render({ forceRefetch: false }, store);
        expect(mockDispatch).not.toHaveBeenCalledWith(subscriptionActions.fetchActiveSubscription());
      });
    });
  });
});

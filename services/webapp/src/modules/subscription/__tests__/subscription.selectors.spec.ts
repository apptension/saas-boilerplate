import { selectActiveSubscriptionRenewalDate } from '../subscription.selectors';
import { prepareState } from '../../../mocks/store';
import { subscriptionFactory, subscriptionPhaseFactory, subscriptionPlanFactory } from '../../../mocks/factories';
import { SubscriptionPlanName } from '../../../shared/services/api/subscription/types';

describe('Subscription: selectors', () => {
  describe('selectActiveSubscriptionRenewalDate', () => {
    describe('subscription is not canceled', () => {
      it('should return current phase end date', () => {
        const periodEndDateString = new Date('Jan 1, 2099 GMT').toISOString();
        const store = prepareState((state) => {
          const phases = [
            subscriptionPhaseFactory({ endDate: periodEndDateString }),
            subscriptionPhaseFactory({ startDate: periodEndDateString }),
          ];
          state.subscription.activeSubscription = subscriptionFactory({ phases });
        });
        expect(selectActiveSubscriptionRenewalDate(store)).toEqual(periodEndDateString);
      });
    });

    describe('subscription is canceled', () => {
      it('should return undefined', () => {
        const periodEndDateString = new Date('Jan 1, 2099 GMT').toISOString();
        const store = prepareState((state) => {
          state.subscription.activeSubscription = subscriptionFactory();
          const phases = [
            subscriptionPhaseFactory({ endDate: periodEndDateString }),
            subscriptionPhaseFactory({
              startDate: periodEndDateString,
              item: {
                price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }),
              },
            }),
          ];
          state.subscription.activeSubscription = subscriptionFactory({ phases });
        });
        expect(selectActiveSubscriptionRenewalDate(store)).toBeUndefined();
      });
    });
  });
});

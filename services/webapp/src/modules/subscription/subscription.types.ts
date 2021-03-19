import { Subscription, SubscriptionPlan } from '../../shared/services/api/subscription/types';

export interface SubscriptionState {
  activeSubscription: Subscription | null;
  availablePlans: SubscriptionPlan[];
}

export type FetchSubscriptionSuccessPayload = Subscription;

export type FetchSubscriptionPlansSuccessPayload = SubscriptionPlan[];

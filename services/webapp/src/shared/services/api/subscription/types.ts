import { StripePaymentMethod } from '../stripe/paymentMethod';

export enum SubscriptionPlanName {
  FREE = 'free_plan',
  MONTHLY = 'monthly_plan',
  YEARLY = 'yearly_plan',
}

export interface Subscription {
  id: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  defaultPaymentMethod: StripePaymentMethod | null;
  item: {
    id: string;
    price: {
      id: string;
      product: {
        id: string;
        name: SubscriptionPlanName;
      };
      unitAmount: number;
    };
    quantity: number;
  };
}

export type SubscriptionApiGetResponseData = Subscription;

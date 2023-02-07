import { gql } from '../../../../shared/services/graphqlApi/__generated/gql';

export const SUBSCRIPTION_ACTIVE_FRAGMENT = gql(/* GraphQL */ `
  fragment subscriptionActiveSubscriptionFragment_ on SubscriptionScheduleType {
    phases {
      startDate
      endDate
      trialEnd
      item {
        price {
          ...subscriptionPlanItemFragment_
          id
        }
        quantity
      }
    }
    subscription {
      startDate
      trialEnd
      trialStart
      id
    }
    canActivateTrial
    defaultPaymentMethod {
      ...stripePaymentMethodFragment_
      id
    }
  }

  fragment subscriptionPlanItemFragment_ on SubscriptionPlanType {
    id
    pk
    product {
      id
      name
    }
    unitAmount
  }

  fragment stripePaymentMethodFragment_ on StripePaymentMethodType {
    id
    pk
    type
    card
    billingDetails
  }
`);

export const SUBSCRIPTION_ACTIVE_PLAN_DETAILS_QUERY = gql(/* GraphQL */ `
  query subscriptionActivePlanDetailsQuery_ {
    activeSubscription {
      ...subscriptionActiveSubscriptionFragment_
      id
    }
  }
`);

import { gql } from '../../../services/graphqlApi/__generated/gql';

export const subscriptionActiveFragment = gql(/* GraphQL */ `
  fragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {
    phases {
      startDate
      endDate
      trialEnd
      item {
        price {
          ...subscriptionPlanItemFragment
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

  fragment subscriptionPlanItemFragment on SubscriptionPlanType {
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

export const subscriptionActivePlanDetailsQuery = gql(/* GraphQL */ `
  query subscriptionActivePlanDetailsQuery_ {
    activeSubscription {
      ...subscriptionActiveSubscriptionFragment
      id
    }
  }
`);

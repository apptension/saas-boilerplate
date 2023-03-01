import { gql } from '../../../../shared/services/graphqlApi/__generated/gql';

export const subscriptionActiveFragment = gql(/* GraphQL */ `
  fragment subscriptionActiveSubscriptionDetailsFragment on SubscriptionScheduleType {
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

import { gql } from '../../../services/graphqlApi/__generated/gql';

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
`);

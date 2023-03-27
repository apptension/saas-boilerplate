import { gql } from '@sb/webapp-api-client/graphql';

export const subscriptionActiveSubscriptionFragment = gql(/* GraphQL */ `
  fragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {
    phases {
      startDate
      endDate
      trialEnd
      item {
        price {
          pk
          product {
            id
            name
          }
          unitAmount
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
    amount
  }
`);

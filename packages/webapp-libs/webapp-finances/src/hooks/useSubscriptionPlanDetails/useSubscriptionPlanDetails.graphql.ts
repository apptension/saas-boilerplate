import { gql } from '@sb/webapp-api-client/graphql';

export const subscriptionActiveFragment = gql(/* GraphQL */ `
  fragment subscriptionActiveSubscriptionDetailsFragment on SubscriptionScheduleType {
    phases {
      startDate
      endDate
      trialEnd
      item {
        price {
          ...subscriptionPriceItemFragment
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
  query subscriptionActivePlanDetailsQuery_($tenantId: ID!) {
    activeSubscription(tenantId: $tenantId) {
      ...subscriptionActiveSubscriptionFragment
      id
    }
  }
`);

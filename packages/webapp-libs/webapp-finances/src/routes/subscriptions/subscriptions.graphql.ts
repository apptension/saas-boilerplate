import { gql } from '@sb/webapp-api-client/graphql';

export const stripeAllChargesQuery = gql(/* GraphQL */ `
  query stripeAllChargesQuery($tenantId: ID!) {
    allCharges(tenantId: $tenantId) {
      edges {
        node {
          id
          ...stripeChargeFragment
        }
      }
    }
  }
`);

export const STRIPE_CHARGE_FRAGMENT = gql(/* GraphQL */ `
  fragment stripeChargeFragment on StripeChargeType {
    id
    created
    billingDetails
    paymentMethod {
      ...stripePaymentMethodFragment
      id
    }
    amount
    invoice {
      id
      subscription {
        plan {
          ...subscriptionPlanItemFragment
        }
      }
    }
  }
`);

export const SUBSCRIPTION_PLAN_ITEM_FRAGMENT = gql(/* GraphQL */ `
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

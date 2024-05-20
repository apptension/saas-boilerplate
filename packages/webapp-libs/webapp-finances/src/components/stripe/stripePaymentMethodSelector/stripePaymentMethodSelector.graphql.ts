import { gql } from '@sb/webapp-api-client/graphql';

export const stripeSubscriptionQuery = gql(/* GraphQL */ `
  query stripeSubscriptionQuery($tenantId: ID!) {
    allPaymentMethods(tenantId: $tenantId, first: 100) {
      edges {
        node {
          id
          pk
          type
          card
          billingDetails
          ...stripePaymentMethodFragment
          __typename
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }

    activeSubscription(tenantId: $tenantId) {
      ...subscriptionActiveSubscriptionFragment
      id
      __typename
    }
  }
`);

export const stripeDeletePaymentMethodMutation = gql(/* GraphQL */ `
  mutation stripeDeletePaymentMethodMutation($input: DeletePaymentMethodMutationInput!) {
    deletePaymentMethod(input: $input) {
      deletedIds
      activeSubscription {
        defaultPaymentMethod {
          ...stripePaymentMethodFragment
        }
      }
    }
  }
`);

export const stripeUpdateDefaultPaymentMethodMutation = gql(/* GraphQL */ `
  mutation stripeUpdateDefaultPaymentMethodMutation($input: UpdateDefaultPaymentMethodMutationInput!) {
    updateDefaultPaymentMethod(input: $input) {
      activeSubscription {
        ...subscriptionActiveSubscriptionFragment
        id
      }
      paymentMethodEdge {
        node {
          ...stripePaymentMethodFragment
          id
        }
      }
    }
  }
`);

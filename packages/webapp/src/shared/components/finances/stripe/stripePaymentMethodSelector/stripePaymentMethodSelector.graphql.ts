import { gql } from '../../../../../shared/services/graphqlApi/__generated/gql';

export const STRIPE_SUBSCRIPTION_QUERY = gql(/* GraphQL */ `
  query stripeSubscriptionQuery {
    allPaymentMethods(first: 100) {
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

    activeSubscription {
      ...subscriptionActiveSubscriptionFragment_
      id
      __typename
    }
  }
`);

export const STRIPE_DELETE_PAYMENT_METHOD_MUTATION = gql(/* GraphQL */ `
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

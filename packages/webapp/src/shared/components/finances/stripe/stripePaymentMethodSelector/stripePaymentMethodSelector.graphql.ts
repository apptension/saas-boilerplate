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
      ...subscriptionActiveSubscriptionFragment
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

export const STRIPE_UPDATE_PAYMENT_METHOD_MUTATION = gql(/* GraphQL */ `
  mutation stripeUpdateDefaultPaymentMethodMutation($input: UpdateDefaultPaymentMethodMutationInput!) {
    updateDefaultPaymentMethod(input: $input) {
      activeSubscription {
        ...subscriptionActiveSubscriptionFragment
        id
      }
      paymentMethodEdge {
        node {
          # commented only because of the broken apollo types: need to fix it after migration
          #          ...stripePaymentMethodFragment @relay(mask: false)
          ...stripePaymentMethodFragment
          id
        }
      }
    }
  }
`);

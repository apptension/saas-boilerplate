import { gql } from '../../../../../shared/services/graphqlApi/__generated/gql';

export const stripeSubscriptionQuery = gql(/* GraphQL */ `
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
          # commented only because of the broken apollo types: need to fix it after migration
          #          ...stripePaymentMethodFragment @relay(mask: false)
          ...stripePaymentMethodFragment
          id
        }
      }
    }
  }
`);

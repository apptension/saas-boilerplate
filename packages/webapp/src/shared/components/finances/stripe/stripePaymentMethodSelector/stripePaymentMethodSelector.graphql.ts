import { gql } from '../../../../../shared/services/graphqlApi/__generated/gql';

export const STRIPE_ALL_PAYMENTS_METHODS_QUERY = gql(/* GraphQL */ `
  query stripeAllPaymentsMethodsQuery {
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
  }
`);

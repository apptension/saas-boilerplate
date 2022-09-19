import { graphql } from 'react-relay';

graphql`
  mutation stripeDeletePaymentMethodMutation($input: DeletePaymentMethodMutationInput!, $connections: [ID!]!) {
    deletePaymentMethod(input: $input) {
      deletedIds @deleteEdge(connections: $connections)
    }
  }
`;

graphql`
  mutation stripeUpdateDefaultPaymentMethodMutation(
    $input: UpdateDefaultPaymentMethodMutationInput!
    $connections: [ID!]!
  ) {
    updateDefaultPaymentMethod(input: $input) {
      activeSubscription {
        ...subscriptionActiveSubscriptionFragment
      }
      paymentMethodEdge @appendEdge(connections: $connections) {
        node {
          ...stripePaymentMethodFragment @relay(mask: false)
          ...stripePaymentMethodFragment
        }
      }
    }
  }
`;

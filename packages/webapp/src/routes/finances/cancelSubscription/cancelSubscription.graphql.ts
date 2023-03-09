import { gql } from '../../../shared/services/graphqlApi/__generated/gql';

export const subscriptionCancelMutation = gql(/* GraphQL */ `
  mutation subscriptionCancelActiveSubscriptionMutation($input: CancelActiveSubscriptionMutationInput!) {
    cancelActiveSubscription(input: $input) {
      subscriptionSchedule {
        ...subscriptionActiveSubscriptionFragment
        id
      }
    }
  }
`);

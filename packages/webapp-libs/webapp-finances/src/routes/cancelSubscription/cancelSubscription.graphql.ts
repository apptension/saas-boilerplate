import { gql } from '@sb/webapp-api-client/graphql';

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

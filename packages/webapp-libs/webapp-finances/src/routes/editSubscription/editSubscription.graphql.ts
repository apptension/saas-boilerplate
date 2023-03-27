import { gql } from '@sb/webapp-api-client/graphql';

export const subscriptionChangeActiveMutation = gql(/* GraphQL */ `
  mutation subscriptionChangeActiveSubscriptionMutation($input: ChangeActiveSubscriptionMutationInput!) {
    changeActiveSubscription(input: $input) {
      subscriptionSchedule {
        ...subscriptionActiveSubscriptionFragment
        id
      }
    }
  }
`);

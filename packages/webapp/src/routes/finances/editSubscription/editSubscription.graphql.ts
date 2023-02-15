import { gql } from '../../../shared/services/graphqlApi/__generated/gql';

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

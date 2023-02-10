import { gql } from '../../../shared/services/graphqlApi/__generated/gql';

export const SUBSCRIPTION_CHANGE_ACTIVE_MUTATION = gql(/* GraphQL */ `
  mutation subscriptionChangeActiveSubscriptionMutation($input: ChangeActiveSubscriptionMutationInput!) {
    changeActiveSubscription(input: $input) {
      subscriptionSchedule {
        ...subscriptionActiveSubscriptionFragment
        id
      }
    }
  }
`);

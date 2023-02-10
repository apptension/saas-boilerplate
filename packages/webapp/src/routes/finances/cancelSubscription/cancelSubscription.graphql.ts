import { gql } from '../../../shared/services/graphqlApi/__generated/gql';

export const SUBSCRIPTION_CANCEL_MUTATION = gql(/* GraphQL */ `
  mutation subscriptionCancelActiveSubscriptionMutation($input: CancelActiveSubscriptionMutationInput!) {
    cancelActiveSubscription(input: $input) {
      subscriptionSchedule {
        ...subscriptionActiveSubscriptionFragment
        id
      }
    }
  }
`);

// gql(/* GraphQL */ `
//   fragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {
//     phases {
//       startDate
//       endDate
//       trialEnd
//       item {
//         price {
//           ...subscriptionPlanItemFragment
//         }
//         quantity
//       }
//     }
//     subscription {
//       startDate
//       trialEnd
//       trialStart
//     }
//     canActivateTrial
//     defaultPaymentMethod {
//       ...stripePaymentMethodFragment
//     }
//   }
// `);

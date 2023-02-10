import { gql } from '../../../../shared/services/graphqlApi/__generated/gql';

export const SUBSCRIPTION_PLANS_ALL_QUERY = gql(/* GraphQL */ `
  query subscriptionPlansAllQuery {
    allSubscriptionPlans(first: 100) {
      edges {
        node {
          id
          ...subscriptionPlanItemFragment
        }
      }
    }
  }
`);

export const SUBSRIPTION_PLAN_ITEM_FRAGMENT = gql(/* GraphQL */ `
  fragment subscriptionPlanItemFragment on SubscriptionPlanType {
    id
    pk
    product {
      id
      name
    }
    unitAmount
  }
`);

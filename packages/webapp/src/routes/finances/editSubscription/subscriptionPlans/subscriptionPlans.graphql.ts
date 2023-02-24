import { gql } from '../../../../shared/services/graphqlApi/__generated/gql';

export const subscriptionPlansAllQuery = gql(/* GraphQL */ `
  query subscriptionPlansAllQuery {
    allSubscriptionPlans(first: 100) {
      edges {
        node {
          id
          pk
          product {
            id
            name
          }
          unitAmount
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

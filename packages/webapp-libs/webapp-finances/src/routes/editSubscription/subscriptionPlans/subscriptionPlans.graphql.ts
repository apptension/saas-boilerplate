import { gql } from '@sb/webapp-api-client/graphql';

export const subscriptionPlansAllQuery = gql(/* GraphQL */ `
  query subscriptionPlansAllQuery {
    allSubscriptionPlans(first: 100) {
      edges {
        node {
          ...subscriptionPriceItemFragment
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

export const SUBSRIPTION_PRICE_ITEM_FRAGMENT = gql(/* GraphQL */ `
  fragment subscriptionPriceItemFragment on StripePriceType {
    id
    pk
    product {
      id
      name
    }
    unitAmount
  }
`);

import { gql } from '@sb/webapp-api-client/graphql';

export const configContentfulAppQuery = gql(/* GraphQL */ `
  query configContentfulAppConfigQuery {
    appConfigCollection(limit: 1) {
      items {
        name
        privacyPolicy
        termsAndConditions
      }
    }
  }
`);

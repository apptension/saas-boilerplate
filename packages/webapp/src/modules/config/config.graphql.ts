import { gql } from '../../shared/services/graphqlApi/__generated/gql';

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

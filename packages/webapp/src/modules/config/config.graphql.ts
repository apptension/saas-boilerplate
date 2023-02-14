import { gql } from '../../shared/services/graphqlApi/__generated/gql';

export const CONFIG_CONTENTFUL_APP_CONFIG_QUERY = gql(/* GraphQL */ `
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
